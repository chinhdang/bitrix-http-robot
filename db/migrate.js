#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Running ${files.length} migration(s)...`);

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`  -> ${file}`);
    try {
      await pool.query(sql);
      console.log(`     OK`);
    } catch (err) {
      console.error(`     FAILED: ${err.message}`);
      await pool.end();
      process.exit(1);
    }
  }

  console.log('All migrations completed.');
  await pool.end();
}

migrate();
