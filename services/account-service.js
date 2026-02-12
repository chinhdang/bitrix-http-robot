const { query } = require('../db');
const logger = require('../utils/logger');

/**
 * Upsert account — create if not exists, update domain/updated_at if exists
 */
async function upsertAccount(memberId, domain) {
  const result = await query(
    `INSERT INTO accounts (member_id, domain)
     VALUES ($1, $2)
     ON CONFLICT (member_id)
     DO UPDATE SET domain = $2, updated_at = NOW()
     RETURNING *`,
    [memberId, domain]
  );
  return result.rows[0];
}

/**
 * Get account by member_id
 */
async function getByMemberId(memberId) {
  const result = await query(
    'SELECT * FROM accounts WHERE member_id = $1',
    [memberId]
  );
  return result.rows[0] || null;
}

/**
 * Get or create account — ensures an account row exists, returns it
 */
async function getOrCreate(memberId, domain) {
  let account = await getByMemberId(memberId);
  if (!account) {
    account = await upsertAccount(memberId, domain || 'unknown');
  }
  return account;
}

/**
 * Update plan for an account
 */
async function updatePlan(memberId, plan) {
  const result = await query(
    `UPDATE accounts SET plan = $1, updated_at = NOW()
     WHERE member_id = $2
     RETURNING *`,
    [plan, memberId]
  );
  return result.rows[0] || null;
}

/**
 * Update plan by domain
 */
async function updatePlanByDomain(domain, plan) {
  const result = await query(
    `UPDATE accounts SET plan = $1, updated_at = NOW()
     WHERE domain = $2
     RETURNING *`,
    [plan, domain]
  );
  return result.rows[0] || null;
}

module.exports = { upsertAccount, getByMemberId, getOrCreate, updatePlan, updatePlanByDomain };
