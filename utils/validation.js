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
 */
function validateProperties(properties) {
  const errors = [];

  // Validate URL (required)
  if (!properties.url) {
    errors.push('URL is required');
  } else if (!isValidUrl(properties.url)) {
    errors.push('Invalid URL format. Must be http:// or https://');
  }

  // Validate method
  if (properties.method && !isValidMethod(properties.method)) {
    errors.push('Invalid HTTP method. Allowed: GET, POST, PUT, DELETE');
  }

  // Validate headers JSON
  if (properties.headers && !isValidJson(properties.headers)) {
    errors.push('Headers must be valid JSON format');
  }

  // Validate timeout
  if (properties.timeout && !isValidTimeout(properties.timeout)) {
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
