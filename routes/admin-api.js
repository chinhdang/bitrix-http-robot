const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth-middleware');
const requestLogService = require('../services/request-log-service');
const quotaService = require('../services/quota-service');
const logger = require('../utils/logger');

router.use(authMiddleware);

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    if (!req.account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const [stats, chartData, usage] = await Promise.all([
      requestLogService.getStats(req.account.id),
      requestLogService.getChartData(req.account.id),
      quotaService.getUsage(req.memberId)
    ]);

    const successRate = stats.totalRequests > 0
      ? Math.round((stats.successCount / stats.totalRequests) * 100)
      : 0;

    res.json({
      ...stats,
      successRate,
      monthlyUsage: usage?.monthlyUsage || 0,
      quota: usage?.quota || 0,
      plan: usage?.plan || 'free',
      chartData
    });
  } catch (err) {
    logger.error('Dashboard API error', { error: err.message });
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// GET /api/admin/requests
router.get('/requests', async (req, res) => {
  try {
    if (!req.account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const { page, limit, method, status, from, to, url } = req.query;
    const result = await requestLogService.getLog(req.account.id, {
      page: parseInt(page) || 1,
      limit: Math.min(parseInt(limit) || 20, 100),
      method,
      status,
      from,
      to,
      url
    });

    res.json(result);
  } catch (err) {
    logger.error('Requests API error', { error: err.message });
    res.status(500).json({ error: 'Failed to load request log' });
  }
});

// GET /api/admin/usage
router.get('/usage', async (req, res) => {
  try {
    const usage = await quotaService.getUsage(req.memberId);
    if (!usage) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(usage);
  } catch (err) {
    logger.error('Usage API error', { error: err.message });
    res.status(500).json({ error: 'Failed to load usage data' });
  }
});

// GET /api/admin/account
router.get('/account', async (req, res) => {
  try {
    if (!req.account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json({
      memberId: req.account.member_id,
      domain: req.account.domain,
      plan: req.account.plan,
      installedAt: req.account.installed_at
    });
  } catch (err) {
    logger.error('Account API error', { error: err.message });
    res.status(500).json({ error: 'Failed to load account data' });
  }
});

module.exports = router;
