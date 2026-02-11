const { query } = require('../db');
const logger = require('../utils/logger');

/**
 * Log a request execution (fire-and-forget safe)
 */
async function logRequest({ accountId, url, method, statusCode, success, executionTime, errorMessage }) {
  try {
    await query(
      `INSERT INTO request_logs (account_id, url, method, status_code, success, execution_time, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [accountId, url, method, statusCode || null, success, executionTime || null, errorMessage || null]
    );
  } catch (err) {
    logger.error('Failed to log request', { error: err.message, accountId });
  }
}

/**
 * Get monthly request count for an account (current calendar month)
 */
async function getMonthlyCount(accountId) {
  const result = await query(
    `SELECT COUNT(*)::int AS count
     FROM request_logs
     WHERE account_id = $1
       AND created_at >= date_trunc('month', NOW())`,
    [accountId]
  );
  return result.rows[0].count;
}

/**
 * Get dashboard stats for an account (last 30 days)
 */
async function getStats(accountId) {
  const result = await query(
    `SELECT
       COUNT(*)::int AS total_requests,
       COUNT(*) FILTER (WHERE success = true)::int AS success_count,
       COUNT(*) FILTER (WHERE success = false)::int AS fail_count,
       ROUND(AVG(execution_time))::int AS avg_response_time
     FROM request_logs
     WHERE account_id = $1
       AND created_at >= NOW() - INTERVAL '30 days'`,
    [accountId]
  );
  const row = result.rows[0];
  return {
    totalRequests: row.total_requests || 0,
    successCount: row.success_count || 0,
    failCount: row.fail_count || 0,
    avgResponseTime: row.avg_response_time || 0
  };
}

/**
 * Get daily chart data for last 30 days
 */
async function getChartData(accountId) {
  const result = await query(
    `SELECT
       d::date AS date,
       COUNT(r.id)::int AS total,
       COUNT(r.id) FILTER (WHERE r.success = true)::int AS success,
       COUNT(r.id) FILTER (WHERE r.success = false)::int AS fail
     FROM generate_series(
       (NOW() - INTERVAL '29 days')::date,
       NOW()::date,
       '1 day'
     ) AS d
     LEFT JOIN request_logs r
       ON r.account_id = $1
       AND r.created_at::date = d::date
     GROUP BY d::date
     ORDER BY d::date`,
    [accountId]
  );
  return result.rows.map(r => ({
    date: r.date,
    total: r.total,
    success: r.success,
    fail: r.fail
  }));
}

/**
 * Get paginated request log with filters
 */
async function getLog(accountId, { page = 1, limit = 20, method, status, from, to, url } = {}) {
  const conditions = ['account_id = $1'];
  const params = [accountId];
  let idx = 2;

  if (method) {
    conditions.push(`method = $${idx++}`);
    params.push(method.toUpperCase());
  }
  if (status === 'success') {
    conditions.push('success = true');
  } else if (status === 'fail') {
    conditions.push('success = false');
  }
  if (from) {
    conditions.push(`created_at >= $${idx++}`);
    params.push(from);
  }
  if (to) {
    conditions.push(`created_at <= $${idx++}`);
    params.push(to);
  }
  if (url) {
    conditions.push(`url ILIKE $${idx++}`);
    params.push(`%${url}%`);
  }

  const where = conditions.join(' AND ');

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM request_logs WHERE ${where}`,
    params
  );
  const total = countResult.rows[0].total;

  const offset = (page - 1) * limit;
  const dataResult = await query(
    `SELECT id, url, method, status_code, success, execution_time, error_message, created_at
     FROM request_logs
     WHERE ${where}
     ORDER BY created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...params, limit, offset]
  );

  return {
    data: dataResult.rows,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1
  };
}

module.exports = { logRequest, getMonthlyCount, getStats, getChartData, getLog };
