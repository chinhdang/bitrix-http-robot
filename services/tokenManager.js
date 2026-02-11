const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const TOKENS_FILE = path.join(__dirname, '..', 'tokens.json');
const OAUTH_URL = 'https://oauth.bitrix.info/oauth/token/';
const EXPIRY_BUFFER_MS = 5 * 60 * 1000; // refresh 5 minutes before expiry

function loadTokens() {
  try {
    const data = fs.readFileSync(TOKENS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function saveTokens(tokens) {
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2) + '\n');
}

async function refreshTokens(refreshToken) {
  const clientId = process.env.BITRIX24_CLIENT_ID;
  const clientSecret = process.env.BITRIX24_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('BITRIX24_CLIENT_ID and BITRIX24_CLIENT_SECRET must be set in .env');
  }

  console.log('🔄 Refreshing access token...');

  const response = await axios.get(OAUTH_URL, {
    params: {
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken
    }
  });

  const data = response.data;

  if (data.error) {
    throw new Error(`OAuth refresh failed: ${data.error} - ${data.error_description}`);
  }

  const tokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000
  };

  saveTokens(tokens);
  console.log('✅ Token refreshed and saved to tokens.json');

  return tokens;
}

async function getAccessToken() {
  let tokens = loadTokens();

  // Seed from .env if tokens.json doesn't exist
  if (!tokens) {
    const envAccess = process.env.BITRIX24_ACCESS_TOKEN;
    const envRefresh = process.env.BITRIX24_REFRESH_TOKEN;

    if (!envRefresh) {
      throw new Error('No tokens.json found and BITRIX24_REFRESH_TOKEN not set in .env');
    }

    console.log('📦 No tokens.json found, seeding from .env and refreshing...');

    // Force refresh since we don't know when the .env token expires
    tokens = await refreshTokens(envRefresh);
    return tokens.access_token;
  }

  // Check if token is expired or near-expiry
  if (Date.now() >= tokens.expires_at - EXPIRY_BUFFER_MS) {
    tokens = await refreshTokens(tokens.refresh_token);
  }

  return tokens.access_token;
}

module.exports = { getAccessToken };
