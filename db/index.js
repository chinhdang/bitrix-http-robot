const { Pool } = require('pg');
const logger = require('../utils/logger');

let pool = null;

function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    pool.on('error', (err) => {
      logger.error('Unexpected PostgreSQL pool error', { error: err.message });
    });
  }
  return pool;
}

async function query(text, params) {
  const p = getPool();
  if (!p) {
    throw new Error('Database not configured (DATABASE_URL missing)');
  }
  const start = Date.now();
  const result = await p.query(text, params);
  const duration = Date.now() - start;
  logger.debug('DB query', { text: text.substring(0, 80), duration, rows: result.rowCount });
  return result;
}

async function initDb() {
  const p = getPool();
  if (!p) {
    logger.warn('DATABASE_URL not set — skipping DB init');
    return false;
  }
  try {
    await p.query('SELECT 1');
    logger.info('PostgreSQL connected');
    return true;
  } catch (err) {
    logger.error('PostgreSQL connection failed', { error: err.message });
    return false;
  }
}

async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { query, initDb, closeDb, getPool };
