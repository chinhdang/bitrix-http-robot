const accountService = require('./account-service');
const requestLogService = require('./request-log-service');
const logger = require('../utils/logger');

const PLAN_LIMITS = {
  free: 100,
  basic: 1000,
  pro: 10000,
  enterprise: Infinity
};

/**
 * Check if account is within quota.
 * Fail-open: if DB errors, returns allowed = true.
 *
 * @returns {{ allowed: boolean, usage: number, quota: number, plan: string }}
 */
async function checkQuota(memberId, domain) {
  try {
    const account = await accountService.getOrCreate(memberId, domain);
    const plan = account.plan || 'free';
    const quota = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    const usage = await requestLogService.getMonthlyCount(account.id);

    return {
      allowed: usage < quota,
      usage,
      quota,
      plan,
      accountId: account.id
    };
  } catch (err) {
    logger.error('Quota check failed — allowing request (fail-open)', { error: err.message, memberId });
    return { allowed: true, usage: 0, quota: 0, plan: 'unknown', accountId: null };
  }
}

/**
 * Get usage info for display
 */
async function getUsage(memberId) {
  const account = await accountService.getByMemberId(memberId);
  if (!account) return null;

  const plan = account.plan || 'free';
  const quota = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const usage = await requestLogService.getMonthlyCount(account.id);

  return { plan, monthlyUsage: usage, quota, installedAt: account.installed_at };
}

module.exports = { checkQuota, getUsage, PLAN_LIMITS };
