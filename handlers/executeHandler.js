const { makeHttpRequest } = require('../services/httpRequest');
const { sendBizprocEvent } = require('../services/bitrixApi');
const { validateProperties } = require('../utils/validation');
const logger = require('../utils/logger');

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
      url: properties?.url,
      method: properties?.method
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

    // Parse headers if provided
    let headers = {};
    if (config.headers) {
      try {
        headers = JSON.parse(config.headers);
      } catch (e) {
        throw new Error('Invalid headers JSON format');
      }
    }

    // Prepare request body
    let requestBody = null;

    // Priority 1: Raw body (if provided)
    if (config.rawBody) {
      requestBody = config.rawBody;
    }
    // Priority 2: Form data (if provided)
    else if (config.formData && Array.isArray(config.formData) && config.formData.length > 0) {
      // Build form data object
      const formDataObj = {};
      config.formData.forEach(field => {
        if (field.key) {
          formDataObj[field.key] = field.value || '';
        }
      });

      // Check Content-Type to determine format
      const contentType = headers['Content-Type'] || headers['content-type'] || '';

      if (contentType.includes('application/x-www-form-urlencoded')) {
        // Convert to URL-encoded format
        const params = new URLSearchParams();
        Object.keys(formDataObj).forEach(key => {
          params.append(key, formDataObj[key]);
        });
        requestBody = params.toString();
      } else {
        // Default to JSON
        requestBody = JSON.stringify(formDataObj);
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }
      }

      logger.debug('Built request body from form data', { formDataObj, requestBody });
    }
    // Priority 3: Legacy body property
    else if (config.body) {
      requestBody = config.body;
    }

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

    // Send result back to Bitrix24
    await sendBizprocEvent({
      event_token: event_token,
      return_values: returnValues,
      log_message: `HTTP ${requestConfig.method} request to ${properties.url} completed with status ${response.status} in ${executionTime}ms`,
      auth: auth
    });

    logger.info('Response sent to Bitrix24', { event_token });

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
  executeHttpRequest
};
