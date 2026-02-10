/**
 * OAuth Helper for Bitrix24 Local Application
 *
 * This script helps you get access_token using client_id and client_secret
 * via OAuth 2.0 authorization_code or client_credentials flow
 */

const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

const CLIENT_ID = process.env.BITRIX24_CLIENT_ID;
const CLIENT_SECRET = process.env.BITRIX24_CLIENT_SECRET;
const BITRIX24_DOMAIN = process.env.BITRIX24_DOMAIN;

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Get access token using authorization code flow
 */
async function getTokenWithAuthCode() {
  console.log('\n=== OAuth 2.0 Authorization Code Flow ===\n');

  // Step 1: Display authorization URL
  const authUrl = `https://${BITRIX24_DOMAIN}/oauth/authorize/?client_id=${CLIENT_ID}&response_type=code`;

  console.log('Step 1: Open this URL in your browser:');
  console.log(authUrl);
  console.log('\nAfter authorization, you will be redirected to a URL containing the code parameter.');
  console.log('Example: https://your-handler-url.com/?code=ABC123&domain=...\n');

  // Step 2: Ask for the code
  rl.question('Enter the authorization code from URL: ', async (code) => {
    if (!code) {
      console.error('Error: Authorization code is required');
      rl.close();
      return;
    }

    try {
      // Step 3: Exchange code for tokens
      console.log('\nExchanging code for tokens...');

      const response = await axios.post('https://oauth.bitrix.info/oauth/token/', null, {
        params: {
          grant_type: 'authorization_code',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: code.trim()
        }
      });

      const data = response.data;

      console.log('\n✅ Success! Tokens received:\n');
      console.log('Access Token:', data.access_token);
      console.log('Refresh Token:', data.refresh_token);
      console.log('Expires In:', data.expires_in, 'seconds (1 hour)');
      console.log('Scope:', data.scope);
      console.log('Domain:', data.domain);
      console.log('Member ID:', data.member_id);

      console.log('\n📝 Update your .env file:');
      console.log(`BITRIX24_ACCESS_TOKEN=${data.access_token}`);
      console.log(`BITRIX24_REFRESH_TOKEN=${data.refresh_token}`);

      rl.close();
    } catch (error) {
      console.error('\n❌ Error getting tokens:');
      console.error(error.response?.data || error.message);
      rl.close();
    }
  });
}

/**
 * Get access token using client credentials flow (server-to-server)
 */
async function getTokenWithClientCredentials() {
  console.log('\n=== OAuth 2.0 Client Credentials Flow ===\n');

  try {
    console.log('Requesting access token...');

    const response = await axios.post('https://oauth.bitrix.info/oauth/token/', null, {
      params: {
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'bizproc'
      }
    });

    const data = response.data;

    console.log('\n✅ Success! Token received:\n');
    console.log('Access Token:', data.access_token);
    console.log('Expires In:', data.expires_in, 'seconds');
    console.log('Scope:', data.scope);

    console.log('\n📝 Update your .env file:');
    console.log(`BITRIX24_ACCESS_TOKEN=${data.access_token}`);

    console.log('\n⚠️  Note: This token will expire. You may need to refresh it.');

  } catch (error) {
    console.error('\n❌ Error getting token:');
    console.error(error.response?.data || error.message);
  }
}

/**
 * Refresh an existing access token
 */
async function refreshToken() {
  console.log('\n=== OAuth 2.0 Token Refresh ===\n');

  rl.question('Enter your refresh_token: ', async (refreshToken) => {
    if (!refreshToken) {
      console.error('Error: Refresh token is required');
      rl.close();
      return;
    }

    try {
      console.log('\nRefreshing access token...');

      const response = await axios.post('https://oauth.bitrix.info/oauth/token/', null, {
        params: {
          grant_type: 'refresh_token',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          refresh_token: refreshToken.trim()
        }
      });

      const data = response.data;

      console.log('\n✅ Success! New tokens:\n');
      console.log('Access Token:', data.access_token);
      console.log('Refresh Token:', data.refresh_token);
      console.log('Expires In:', data.expires_in, 'seconds');

      console.log('\n📝 Update your .env file:');
      console.log(`BITRIX24_ACCESS_TOKEN=${data.access_token}`);
      console.log(`BITRIX24_REFRESH_TOKEN=${data.refresh_token}`);

      rl.close();
    } catch (error) {
      console.error('\n❌ Error refreshing token:');
      console.error(error.response?.data || error.message);
      rl.close();
    }
  });
}

/**
 * Main menu
 */
function main() {
  // Validate configuration
  if (!CLIENT_ID || !CLIENT_SECRET || !BITRIX24_DOMAIN) {
    console.error('❌ Missing configuration!');
    console.error('Please set the following in your .env file:');
    console.error('  - BITRIX24_CLIENT_ID');
    console.error('  - BITRIX24_CLIENT_SECRET');
    console.error('  - BITRIX24_DOMAIN');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('Bitrix24 OAuth Helper');
  console.log('='.repeat(60));
  console.log(`\nDomain: ${BITRIX24_DOMAIN}`);
  console.log(`Client ID: ${CLIENT_ID}`);
  console.log(`Client Secret: ${CLIENT_SECRET.substring(0, 10)}...`);

  console.log('\n\nSelect OAuth flow:\n');
  console.log('1. Authorization Code Flow (recommended for user authorization)');
  console.log('2. Client Credentials Flow (server-to-server)');
  console.log('3. Refresh Token');
  console.log('4. Exit\n');

  rl.question('Enter your choice (1-4): ', (choice) => {
    switch (choice.trim()) {
      case '1':
        getTokenWithAuthCode();
        break;
      case '2':
        getTokenWithClientCredentials();
        break;
      case '3':
        refreshToken();
        break;
      case '4':
        console.log('Goodbye!');
        rl.close();
        break;
      default:
        console.log('Invalid choice');
        rl.close();
    }
  });
}

// Run
main();
