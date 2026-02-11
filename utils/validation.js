/**
 * Validates URL format
 */
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch (error) {
    return false;
  }
}

/**
 * Validates JSON string
 */
function isValidJson(str) {
  if (!str) return true; // Empty is valid
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validates timeout value
 */
function isValidTimeout(timeout) {
  const num = parseInt(timeout);
  return !isNaN(num) && num > 0 && num <= 300000; // Max 5 minutes
}

/**
 * Validates HTTP method
 */
function isValidMethod(method) {
  const validMethods = ['GET', 'POST', 'PUT', 'DELETE'];
  return validMethods.includes(method.toUpperCase());
}

/**
 * Sanitize and validate properties from Bitrix24 request
 * Supports both direct properties and config JSON property
 */
function validateProperties(properties) {
  const errors = [];

  // If config JSON is present, parse and validate from it
  let props = properties;
  if (properties.config) {
    try {
      props = JSON.parse(properties.config);
    } catch (e) {
      // If config is not valid JSON, fall back to direct properties
      props = properties;
    }
  }

  // Validate URL (required)
  if (!props.url) {
    errors.push('URL is required');
  } else if (!isValidUrl(props.url)) {
    errors.push('Invalid URL format. Must be http:// or https://');
  }

  // Validate method
  if (props.method && !isValidMethod(props.method)) {
    errors.push('Invalid HTTP method. Allowed: GET, POST, PUT, DELETE');
  }

  // Validate timeout
  if (props.timeout && !isValidTimeout(props.timeout)) {
    errors.push('Timeout must be between 1 and 300000 milliseconds');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

module.exports = {
  isValidUrl,
  isValidJson,
  isValidTimeout,
  isValidMethod,
  validateProperties
};
