#!/usr/bin/env node
/**
 * Seed script — creates owner account (enterprise/unlimited) + 30 days of fake request logs
 */
const { Pool } = require('pg');
require('dotenv').config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const OWNER_MEMBER_ID = '48dcaa0e9a66e606873278792ca79a56';
const OWNER_DOMAIN = 'tamgiac.bitrix24.com';

async function seed() {
  const pool = new Pool({
    connectionString: DB_URL,
    ssl: DB_URL.includes('railway') ? { rejectUnauthorized: false } : false
  });

  try {
    // 1. Upsert owner account as enterprise (unlimited)
    const accountResult = await pool.query(
      `INSERT INTO accounts (member_id, domain, plan)
       VALUES ($1, $2, 'enterprise')
       ON CONFLICT (member_id)
       DO UPDATE SET domain = $2, plan = 'enterprise', updated_at = NOW()
       RETURNING *`,
      [OWNER_MEMBER_ID, OWNER_DOMAIN]
    );
    const account = accountResult.rows[0];
    console.log(`Account: id=${account.id}, domain=${account.domain}, plan=${account.plan}`);

    // 2. Generate 30 days of fake request logs
    const urls = [
      'https://api.example.com/orders',
      'https://api.stripe.com/v1/charges',
      'https://hooks.slack.com/services/T00/B00/xxx',
      'https://api.sendgrid.com/v3/mail/send',
      'https://api.openai.com/v1/chat/completions',
      'https://jsonplaceholder.typicode.com/posts',
      'https://httpbin.org/post',
      'https://api.telegram.org/bot/sendMessage'
    ];
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

    let inserted = 0;
    for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
      // Random 3-15 requests per day
      const count = Math.floor(Math.random() * 13) + 3;
      for (let i = 0; i < count; i++) {
        const url = urls[Math.floor(Math.random() * urls.length)];
        const method = methods[Math.floor(Math.random() * methods.length)];
        const success = Math.random() > 0.15; // 85% success rate
        const statusCode = success
          ? [200, 201, 204][Math.floor(Math.random() * 3)]
          : [400, 401, 404, 500, 502, 503][Math.floor(Math.random() * 6)];
        const executionTime = Math.floor(Math.random() * 2000) + 50;
        const errorMessage = success ? null : ['Timeout', 'Connection refused', 'Bad Request', 'Unauthorized'][Math.floor(Math.random() * 4)];

        // Random time within that day
        const hours = Math.floor(Math.random() * 14) + 8; // 8am-10pm
        const minutes = Math.floor(Math.random() * 60);

        await pool.query(
          `INSERT INTO request_logs (account_id, url, method, status_code, success, execution_time, error_message, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '${daysAgo} days' + INTERVAL '${hours} hours' + INTERVAL '${minutes} minutes')`,
          [account.id, url, method, statusCode, success, executionTime, errorMessage]
        );
        inserted++;
      }
    }

    console.log(`Inserted ${inserted} request log entries (30 days)`);
    console.log('Seed completed!');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
