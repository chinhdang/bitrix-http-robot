const axios = require('axios');
const logger = require('../utils/logger');
const accountService = require('../services/account-service');
const { getPool } = require('../db');

// Cache verified auth tokens: memberId -> { verifiedAt, domain }
const authCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Middleware to verify Bitrix24 auth for admin API requests.
 * Expects X-Member-Id and X-Auth-Id headers.
 * Verifies via Bitrix24 app.info API, caches for 5 minutes.
 * Attaches req.account (from DB) on success.
 */
async function authMiddleware(req, res, next) {
  const memberId = req.headers['x-member-id'];
  const authId = req.headers['x-auth-id'];
  const domain = req.headers['x-domain'];

  if (!memberId || !authId || !domain) {
    return res.status(401).json({ error: 'Missing auth headers (X-Member-Id, X-Auth-Id, X-Domain)' });
  }

  // Check cache
  const cached = authCache.get(memberId);
  if (cached && (Date.now() - cached.verifiedAt) < CACHE_TTL) {
    req.account = cached.account;
    return next();
  }

  // Verify with Bitrix24
  try {
    const response = await axios.get(`https://${domain}/rest/app.info`, {
      params: { auth: authId },
      timeout: 5000
    });

    if (response.data.error) {
      logger.warn('Auth verification failed', { memberId, error: response.data.error });
      return res.status(403).json({ error: 'Auth verification failed' });
    }

    // Get/create account in DB
    let account = null;
    if (getPool()) {
      try {
        account = await accountService.getOrCreate(memberId, domain);
      } catch (err) {
        logger.error('Failed to get account during auth', { error: err.message });
      }
    }

    // Cache the result
    authCache.set(memberId, { verifiedAt: Date.now(), account, domain });

    req.account = account;
    req.memberId = memberId;
    req.domain = domain;
    next();
  } catch (err) {
    logger.error('Auth verification request failed', { error: err.message, domain });
    return res.status(403).json({ error: 'Auth verification failed' });
  }
}

module.exports = authMiddleware;
