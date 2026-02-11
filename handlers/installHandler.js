/**
 * Handles Bitrix24 app installation/uninstallation events
 * Supports both local app and marketplace (mass-market) flows
 */

const axios = require('axios');
const logger = require('../utils/logger');
const { getPool } = require('../db');
const accountService = require('../services/account-service');
const oauthService = require('../services/oauth-service');
const { robotConfig } = require('../install');

const HANDLER_URL = process.env.HANDLER_URL;

/**
 * Handle app installation (ONAPPINSTALL)
 *
 * Bitrix24 sends:
 * - Local app: { auth: { access_token, refresh_token, domain, member_id, ... } }
 * - Marketplace: { auth: { access_token, refresh_token, domain, member_id, client_endpoint, ... } }
 */
async function handleInstall(req, res) {
  try {
    const body = req.body;
    const auth = body.auth || body;

    const memberId = auth.member_id || auth.MEMBER_ID;
    const domain = auth.domain || auth.DOMAIN || '';
    const accessToken = auth.access_token || auth.AUTH_ID;
    const refreshToken = auth.refresh_token || auth.REFRESH_ID;

    logger.info('App installation event', {
      memberId,
      domain,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      clientEndpoint: auth.client_endpoint
    });

    if (!memberId) {
      return res.json({ success: false, error: 'No member_id provided' });
    }

    const pool = getPool();

    // 1. Upsert account
    if (pool) {
      try {
        await accountService.upsertAccount(memberId, domain || 'unknown');
        logger.info('Account upserted on install', { memberId, domain });
      } catch (err) {
        logger.error('Failed to upsert account on install', { error: err.message });
      }
    }

    // 2. Save OAuth tokens (marketplace flow)
    if (pool && accessToken && refreshToken) {
      try {
        await oauthService.saveTokens(memberId, {
          domain,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: auth.expires_in
            ? Date.now() + parseInt(auth.expires_in) * 1000
            : Date.now() + 3600 * 1000,
          client_endpoint: auth.client_endpoint || null,
          server_endpoint: auth.server_endpoint || null,
          scope: auth.scope || null
        });
        logger.info('OAuth tokens saved on install', { memberId });
      } catch (err) {
        logger.error('Failed to save OAuth tokens on install', { error: err.message });
      }
    }

    // 3. Auto-register robot on the installing portal
    if (accessToken && HANDLER_URL) {
      try {
        await registerRobotOnPortal(accessToken, domain, auth.client_endpoint);
        logger.info('Robot auto-registered on install', { memberId, domain });
      } catch (err) {
        // Not fatal — robot might already exist
        logger.warn('Robot auto-registration failed (may already exist)', {
          memberId,
          error: err.message
        });
      }
    }

    res.json({ success: true, message: 'Installation successful' });
  } catch (error) {
    logger.error('Installation error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Register robot + activity on a portal using an access token
 */
async function registerRobotOnPortal(accessToken, domain, clientEndpoint) {
  const baseUrl = clientEndpoint || `https://${domain}/rest/`;

  const config = {
    CODE: robotConfig.CODE,
    HANDLER: `${HANDLER_URL}/bitrix-handler/execute`,
    AUTH_USER_ID: 1,
    USE_SUBSCRIPTION: 'Y',
    USE_PLACEMENT: 'Y',
    PLACEMENT_HANDLER: `${HANDLER_URL}/placement/robot-settings`,
    NAME: robotConfig.NAME,
    DESCRIPTION: robotConfig.DESCRIPTION,
    PROPERTIES: robotConfig.PROPERTIES,
    RETURN_PROPERTIES: robotConfig.RETURN_PROPERTIES
  };

  // Register as automation rule
  try {
    await axios.post(`${baseUrl}bizproc.robot.add`, config, {
      params: { auth: accessToken },
      timeout: 15000
    });
  } catch (err) {
    const errData = err.response?.data;
    // Ignore "already exists" error
    if (errData?.error !== 'ERROR_ACTIVITY_ALREADY_INSTALLED') {
      logger.warn('bizproc.robot.add failed', { error: errData || err.message });
    }
  }

  // Register as workflow activity
  try {
    await axios.post(`${baseUrl}bizproc.activity.add`, config, {
      params: { auth: accessToken },
      timeout: 15000
    });
  } catch (err) {
    const errData = err.response?.data;
    if (errData?.error !== 'ERROR_ACTIVITY_ALREADY_INSTALLED') {
      logger.warn('bizproc.activity.add failed', { error: errData || err.message });
    }
  }
}

/**
 * Handle app uninstallation (ONAPPUNINSTALL)
 */
async function handleUninstall(req, res) {
  try {
    const body = req.body;
    const auth = body.auth || body;
    const memberId = auth.member_id || auth.MEMBER_ID;
    const domain = auth.domain || auth.DOMAIN || '';

    logger.info('App uninstallation event', { memberId, domain });

    // Clean up OAuth tokens
    if (getPool() && memberId) {
      try {
        await oauthService.deleteTokens(memberId);
        logger.info('OAuth tokens deleted on uninstall', { memberId });
      } catch (err) {
        logger.error('Failed to delete OAuth tokens', { error: err.message });
      }
    }

    res.json({ success: true, message: 'Uninstallation successful' });
  } catch (error) {
    logger.error('Uninstallation error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { handleInstall, handleUninstall };
