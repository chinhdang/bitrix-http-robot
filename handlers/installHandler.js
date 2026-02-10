/**
 * Handles Bitrix24 app installation events
 * This can be extended to handle OAuth flow and app lifecycle events
 */

const logger = require('../utils/logger');

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
