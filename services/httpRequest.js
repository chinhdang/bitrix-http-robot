const axios = require('axios');

/**
 * Makes HTTP request to external server
 *
 * @param {Object} config
 * @param {string} config.url - Target URL
 * @param {string} config.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} config.headers - Request headers
 * @param {string} config.body - Request body (for POST/PUT)
 * @param {number} config.timeout - Request timeout in milliseconds
 * @returns {Object} Response object with data, status, and headers
 */
async function makeHttpRequest({ url, method = 'GET', headers = {}, body = null, timeout = 30000 }) {
  // Validate URL
  if (!url) {
    throw new Error('URL is required');
  }

  // Validate method
  const validMethods = ['GET', 'POST', 'PUT', 'DELETE'];
  const upperMethod = method.toUpperCase();
  if (!validMethods.includes(upperMethod)) {
    throw new Error(`Invalid HTTP method: ${method}. Allowed: ${validMethods.join(', ')}`);
  }

  // Prepare request configuration
  const requestConfig = {
    method: upperMethod,
    url: url,
    headers: headers,
    timeout: timeout,
    validateStatus: () => true // Accept all HTTP status codes
  };

  // Add body for POST/PUT requests
  if (['POST', 'PUT'].includes(upperMethod) && body) {
    // Try to parse body as JSON if it's a string
    if (typeof body === 'string') {
      try {
        // If headers indicate JSON, parse it
        const contentType = headers['Content-Type'] || headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          requestConfig.data = JSON.parse(body);
        } else {
          requestConfig.data = body;
        }
      } catch (e) {
        // If parsing fails, send as is
        requestConfig.data = body;
      }
    } else {
      requestConfig.data = body;
    }
  }

  try {
    const response = await axios(requestConfig);

    return {
      data: response.data,
      status: response.status,
      headers: response.headers,
      statusText: response.statusText
    };
  } catch (error) {
    // Handle axios errors
    if (error.response) {
      // Server responded with error status
      return {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers,
        statusText: error.response.statusText
      };
    } else if (error.request) {
      // Request made but no response received
      throw new Error(`No response received from ${url}: ${error.message}`);
    } else {
      // Error in request configuration
      throw new Error(`Request configuration error: ${error.message}`);
    }
  }
}

module.exports = {
  makeHttpRequest
};
