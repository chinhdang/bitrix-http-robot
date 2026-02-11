/**
 * Handles Bitrix24 app installation events
 * This can be extended to handle OAuth flow and app lifecycle events
 */

const logger = require('../utils/logger');
const { getPool } = require('../db');
const accountService = require('../services/account-service');

/**
 * Handle app installation
 */
async function handleInstall(req, res) {
  try {
    const { auth, event } = req.body;

    logger.info('App installation event', {
      event,
      domain: auth?.domain
    });

    // Upsert account in DB
    if (getPool() && auth) {
      const memberId = auth.member_id || auth.MEMBER_ID;
      const domain = auth.domain || auth.DOMAIN;
      if (memberId) {
        try {
          await accountService.upsertAccount(memberId, domain || 'unknown');
          logger.info('Account upserted on install', { memberId, domain });
        } catch (err) {
          logger.error('Failed to upsert account on install', { error: err.message });
        }
      }
    }

    res.json({
      success: true,
      message: 'Installation successful'
    });
  } catch (error) {
    logger.error('Installation error', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Handle app uninstallation
 */
async function handleUninstall(req, res) {
  try {
    const { auth, event } = req.body;

    logger.info('App uninstallation event', {
      event,
      domain: auth?.domain
    });

    res.json({
      success: true,
      message: 'Uninstallation successful'
    });
  } catch (error) {
    logger.error('Uninstallation error', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  handleInstall,
  handleUninstall
};
