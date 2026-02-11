const { makeHttpRequest } = require('../services/httpRequest');
const { sendBizprocEvent } = require('../services/bitrixApi');
const { validateProperties } = require('../utils/validation');
const logger = require('../utils/logger');

/**
 * Extract a value from an object using dot-notation path
 * Supports: "data.order_id", "data.items[0].name", "status"
 */
function extractJsonPath(obj, path) {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Build request headers from config (array/string/object) + auth headers
 */
function buildRequestHeaders(config) {
  let headers = {};
  if (config.headers) {
    if (Array.isArray(config.headers)) {
      config.headers.forEach(header => {
        if (header.key) {
          headers[header.key] = header.value || '';
        }
      });
    } else if (typeof config.headers === 'string') {
      try {
        headers = JSON.parse(config.headers);
      } catch (e) {
        throw new Error('Invalid headers JSON format');
      }
    } else if (typeof config.headers === 'object') {
      headers = config.headers;
    }
  }

  // Handle authorization
  if (config.authType && config.authType !== 'none') {
    if (config.authType === 'bearer' && config.bearerToken) {
      headers['Authorization'] = `Bearer ${config.bearerToken}`;
    } else if (config.authType === 'basic' && config.basicUsername && config.basicPassword) {
      const credentials = Buffer.from(`${config.basicUsername}:${config.basicPassword}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    } else if (config.authType === 'api-key' && config.apiKeyName && config.apiKeyValue) {
      if (config.apiKeyLocation === 'header') {
        headers[config.apiKeyName] = config.apiKeyValue;
      }
    }
  }

  return headers;
}

/**
 * Build request body from config bodyType/formData/rawBody
 * May modify headers (e.g. add Content-Type for JSON form data)
 */
function buildRequestBody(config, headers) {
  let requestBody = null;

  if (config.bodyType === 'raw' && config.rawBody) {
    requestBody = config.rawBody;
  } else if (config.bodyType === 'form-data' && config.formData && Array.isArray(config.formData) && config.formData.length > 0) {
    const formDataObj = {};
    config.formData.forEach(field => {
      if (field.key) {
        formDataObj[field.key] = field.value || '';
      }
    });

    const contentType = headers['Content-Type'] || headers['content-type'] || '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams();
      Object.keys(formDataObj).forEach(key => {
        params.append(key, formDataObj[key]);
      });
      requestBody = params.toString();
    } else {
      requestBody = JSON.stringify(formDataObj);
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    logger.debug('Built request body from form data', { formDataObj, requestBody });
  } else if (config.body) {
    requestBody = config.body;
  }

  return requestBody;
}

/**
 * Main handler for HTTP Request Robot/Activity execution
 * This is called by Bitrix24 when the robot/activity runs in a workflow
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function executeHttpRequest(req, res) {
  const startTime = Date.now();

  try {
    // Extract data from Bitrix24 request
    const {
      event_token,
      properties,
      auth,
      document_id,
      document_type
    } = req.body;

    logger.info('Received HTTP request execution', {
      event_token,
      document_id,
      document_type,
      has_config: !!properties?.config,
      raw_config: properties?.config
    });

    // Validate event_token
    if (!event_token) {
      throw new Error('event_token is required');
    }

    // Validate auth
    if (!auth) {
      throw new Error('auth is required');
    }

    // Validate properties
    const validation = validateProperties(properties || {});
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Check if this is from placement UI (has config property)
    let config = properties;
    if (properties.config) {
      try {
        config = JSON.parse(properties.config);
        logger.info('Using placement UI config', { config });
      } catch (e) {
        logger.warn('Failed to parse placement config, using direct properties');
      }
    }

    const headers = buildRequestHeaders(config);
    const requestBody = buildRequestBody(config, headers);

    // Prepare HTTP request configuration
    const requestConfig = {
      url: config.url,
      method: config.method || 'GET',
      headers: headers,
      body: requestBody,
      timeout: parseInt(config.timeout) || 30000
    };

    logger.debug('Making HTTP request', requestConfig);

    // Make the HTTP request
    const response = await makeHttpRequest(requestConfig);

    const executionTime = Date.now() - startTime;

    logger.info('HTTP request completed', {
      url: requestConfig.url,
      method: requestConfig.method,
      statusCode: response.status,
      executionTime: `${executionTime}ms`
    });

    // Prepare return values
    const returnValues = {
      responseBody: typeof response.data === 'object'
        ? JSON.stringify(response.data)
        : String(response.data || ''),
      statusCode: response.status,
      responseHeaders: JSON.stringify(response.headers || {}),
      error: ''
    };

    // Extract output mappings from response
    logger.info('Output mapping config', {
      hasOutputMappings: !!config.outputMappings,
      isArray: Array.isArray(config.outputMappings),
      count: config.outputMappings ? config.outputMappings.length : 0,
      mappings: config.outputMappings
    });

    if (config.outputMappings && Array.isArray(config.outputMappings)) {
      const responseData = typeof response.data === 'object'
        ? response.data
        : (() => { try { return JSON.parse(response.data); } catch (e) { return null; } })();

      logger.info('Response data for extraction', {
        type: typeof response.data,
        parsedOk: !!responseData
      });

      if (responseData) {
        config.outputMappings.forEach(mapping => {
          if (mapping.path && mapping.output) {
            try {
              const value = extractJsonPath(responseData, mapping.path);
              if (value !== undefined) {
                returnValues[mapping.output] = typeof value === 'object' ? JSON.stringify(value) : String(value);
              } else {
                returnValues[mapping.output] = mapping.fallback || '';
              }
              logger.info('Extracted output mapping', {
                output: mapping.output,
                path: mapping.path,
                rawValue: value,
                usedFallback: value === undefined && !!mapping.fallback,
                finalValue: returnValues[mapping.output]
              });
            } catch (e) {
              logger.warn('Failed to extract output mapping', { path: mapping.path, error: e.message });
              returnValues[mapping.output] = mapping.fallback || '';
            }
          }
        });
      }
    }

    logger.info('Final return_values to Bitrix24', { returnValues });

    // Send result back to Bitrix24
    const bizprocResult = await sendBizprocEvent({
      event_token: event_token,
      return_values: returnValues,
      log_message: `HTTP ${requestConfig.method} request to ${config.url} completed with status ${response.status} in ${executionTime}ms`,
      auth: auth
    });

    logger.info('bizproc.event.send response', { event_token, bizprocResult });

    // Respond to Bitrix24 immediately
    res.json({
      success: true,
      message: 'Request processed successfully'
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;

    logger.error('Error executing HTTP request', {
      error: error.message,
      stack: error.stack,
      executionTime: `${executionTime}ms`
    });

    // Prepare error return values
    const returnValues = {
      responseBody: '',
      statusCode: 0,
      responseHeaders: '{}',
      error: error.message || 'Unknown error occurred'
    };

    // Try to send error back to Bitrix24
    try {
      if (req.body.event_token && req.body.auth) {
        await sendBizprocEvent({
          event_token: req.body.event_token,
          return_values: returnValues,
          log_message: `Error: ${error.message}`,
          auth: req.body.auth
        });
      }
    } catch (sendError) {
      logger.error('Failed to send error to Bitrix24', {
        originalError: error.message,
        sendError: sendError.message
      });
    }

    // Respond with error
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  executeHttpRequest,
  extractJsonPath,
  buildRequestHeaders,
  buildRequestBody
};
