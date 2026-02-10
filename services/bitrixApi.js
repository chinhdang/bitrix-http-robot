const axios = require('axios');

/**
 * Sends the result back to Bitrix24 using bizproc.event.send
 * This is critical for USE_SUBSCRIPTION workflow pattern
 *
 * @param {Object} params
 * @param {string} params.event_token - Token from the incoming request
 * @param {Object} params.return_values - Values to return to the workflow
 * @param {string} params.log_message - Message to log in Bitrix24
 * @param {Object} params.auth - Authentication object from request
 */
async function sendBizprocEvent({ event_token, return_values, log_message, auth }) {
  const domain = auth.domain || auth.DOMAIN;
  const accessToken = auth.access_token || auth.AUTH_ID;

  if (!domain) {
    throw new Error('Domain not found in auth object');
  }

  if (!accessToken) {
    throw new Error('Access token not found in auth object');
  }

  const url = `https://${domain}/rest/bizproc.event.send`;

  const payload = {
    auth: accessToken,
    event_token: event_token,
    return_values: return_values,
    log_message: log_message || 'Request completed'
  };

  try {
    const response = await axios.post(url, payload);

    if (response.data.error) {
      console.error('Bitrix24 API error:', response.data.error_description);
      throw new Error(response.data.error_description || response.data.error);
    }

    return response.data;
  } catch (error) {
    console.error('Error sending bizproc event:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Extract domain from various auth object formats
 */
function extractDomainFromAuth(auth) {
  return auth.DOMAIN || auth.domain;
}

module.exports = {
  sendBizprocEvent,
  extractDomainFromAuth
};
