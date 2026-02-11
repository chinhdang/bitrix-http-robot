const axios = require('axios');
const { query, getPool } = require('../db');
const logger = require('../utils/logger');

const OAUTH_URL = 'https://oauth.bitrix.info/oauth/token/';
const EXPIRY_BUFFER_MS = 5 * 60 * 1000; // refresh 5 minutes before expiry

/**
 * Save or update OAuth tokens for a member
 */
async function saveTokens(memberId, tokens) {
  const result = await query(
    `INSERT INTO oauth_tokens (member_id, domain, access_token, refresh_token, expires_at, client_endpoint, server_endpoint, scope)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (member_id)
     DO UPDATE SET
       domain = COALESCE($2, oauth_tokens.domain),
       access_token = $3,
       refresh_token = $4,
       expires_at = $5,
       client_endpoint = COALESCE($6, oauth_tokens.client_endpoint),
       server_endpoint = COALESCE($7, oauth_tokens.server_endpoint),
       scope = COALESCE($8, oauth_tokens.scope),
       updated_at = NOW()
     RETURNING *`,
    [
      memberId,
      tokens.domain || null,
      tokens.access_token,
      tokens.refresh_token,
      tokens.expires_at ? new Date(tokens.expires_at) : null,
      tokens.client_endpoint || null,
      tokens.server_endpoint || null,
      tokens.scope || null
    ]
  );
  return result.rows[0];
}

/**
 * Get stored tokens for a member
 */
async function getTokens(memberId) {
  const result = await query(
    'SELECT * FROM oauth_tokens WHERE member_id = $1',
    [memberId]
  );
  return result.rows[0] || null;
}

/**
 * Refresh an expired token via oauth.bitrix.info
 */
async function refreshToken(memberId) {
  const stored = await getTokens(memberId);
  if (!stored) {
    throw new Error(`No stored tokens for member ${memberId}`);
  }

  const clientId = process.env.BITRIX_CLIENT_ID;
  const clientSecret = process.env.BITRIX_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('BITRIX_CLIENT_ID and BITRIX_CLIENT_SECRET must be set');
  }

  logger.info('Refreshing OAuth token', { memberId });

  const response = await axios.get(OAUTH_URL, {
    params: {
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: stored.refresh_token
    },
    timeout: 10000
  });

  const data = response.data;
  if (data.error) {
    throw new Error(`OAuth refresh failed: ${data.error} - ${data.error_description}`);
  }

  const updated = await saveTokens(memberId, {
    domain: stored.domain,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in || 3600) * 1000,
    client_endpoint: data.client_endpoint || stored.client_endpoint,
    server_endpoint: data.server_endpoint || stored.server_endpoint,
    scope: data.scope || stored.scope
  });

  logger.info('OAuth token refreshed', { memberId });
  return updated;
}

/**
 * Get a valid access token, auto-refreshing if expired
 */
async function getValidToken(memberId) {
  let stored = await getTokens(memberId);
  if (!stored) return null;

  // Check if token is expired or near-expiry
  const expiresAt = stored.expires_at ? new Date(stored.expires_at).getTime() : 0;
  if (Date.now() >= expiresAt - EXPIRY_BUFFER_MS) {
    try {
      stored = await refreshToken(memberId);
    } catch (err) {
      logger.error('Token refresh failed', { memberId, error: err.message });
      return null;
    }
  }

  return stored.access_token;
}

/**
 * Make an API call to Bitrix24 REST using stored OAuth tokens
 */
async function makeApiCall(memberId, method, params = {}) {
  const token = await getValidToken(memberId);
  if (!token) {
    throw new Error(`No valid token for member ${memberId}`);
  }

  const stored = await getTokens(memberId);
  const endpoint = stored.client_endpoint || `https://${stored.domain}/rest/`;

  const response = await axios.post(
    `${endpoint}${method}`,
    params,
    {
      params: { auth: token },
      timeout: 15000
    }
  );

  if (response.data.error) {
    throw new Error(`API error: ${response.data.error} - ${response.data.error_description || ''}`);
  }

  return response.data;
}

/**
 * Delete tokens for a member (on uninstall)
 */
async function deleteTokens(memberId) {
  await query('DELETE FROM oauth_tokens WHERE member_id = $1', [memberId]);
}

module.exports = {
  saveTokens,
  getTokens,
  refreshToken,
  getValidToken,
  makeApiCall,
  deleteTokens
};
