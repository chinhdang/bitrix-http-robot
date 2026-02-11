const assert = require('assert');
const { describe, it, beforeEach } = require('node:test');
const http = require('http');
const express = require('express');

// Mock db module
let mockQueryResults = [];
const mockDb = {
  query: async (text, params) => {
    return mockQueryResults.shift() || { rows: [], rowCount: 0 };
  },
  getPool: () => true,
  initDb: async () => true,
  closeDb: async () => {}
};

require.cache[require.resolve('../../db')] = {
  id: require.resolve('../../db'),
  exports: mockDb,
  loaded: true
};

// Mock axios for auth verification
const mockAxios = {
  get: async (url) => {
    if (url.includes('app.info')) {
      return { data: { result: { STATUS: 'F' } } };
    }
    throw new Error('Unknown URL');
  }
};

require.cache[require.resolve('axios')] = {
  id: require.resolve('axios'),
  exports: mockAxios,
  loaded: true
};

// Clear cached modules
delete require.cache[require.resolve('../../services/account-service')];
delete require.cache[require.resolve('../../services/request-log-service')];
delete require.cache[require.resolve('../../services/quota-service')];
delete require.cache[require.resolve('../../middleware/auth-middleware')];
delete require.cache[require.resolve('../../routes/admin-api')];

const adminApiRouter = require('../../routes/admin-api');

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminApiRouter);
  return app;
}

function makeRequest(app, method, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      const options = {
        hostname: 'localhost',
        port,
        path,
        method,
        headers: {
          'content-type': 'application/json',
          ...headers
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          server.close();
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });
      req.on('error', (err) => { server.close(); reject(err); });
      req.end();
    });
  });
}

const authHeaders = {
  'x-member-id': 'test-member',
  'x-auth-id': 'test-auth',
  'x-domain': 'test.bitrix24.com'
};

describe('admin-api', () => {
  beforeEach(() => {
    mockQueryResults = [];
  });

  it('returns 401 without auth headers', async () => {
    const app = createTestApp();
    const res = await makeRequest(app, 'GET', '/api/admin/dashboard');
    assert.strictEqual(res.status, 401);
  });

  it('GET /api/admin/account returns account data', async () => {
    const fakeAccount = {
      id: 1, member_id: 'test-member', domain: 'test.bitrix24.com',
      plan: 'free', installed_at: '2026-01-01'
    };
    // Auth middleware: getOrCreate
    mockQueryResults.push({ rows: [fakeAccount], rowCount: 1 });

    const app = createTestApp();
    const res = await makeRequest(app, 'GET', '/api/admin/account', authHeaders);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.memberId, 'test-member');
    assert.strictEqual(res.body.plan, 'free');
  });

  it('GET /api/admin/usage returns usage data', async () => {
    const fakeAccount = {
      id: 2, member_id: 'usage-member', domain: 'usage.bitrix24.com',
      plan: 'basic', installed_at: '2026-01-01'
    };
    // Auth middleware: getOrCreate
    mockQueryResults.push({ rows: [fakeAccount], rowCount: 1 });
    // getUsage: getByMemberId
    mockQueryResults.push({ rows: [fakeAccount], rowCount: 1 });
    // getUsage: getMonthlyCount
    mockQueryResults.push({ rows: [{ count: 350 }], rowCount: 1 });

    const usageHeaders = {
      'x-member-id': 'usage-member',
      'x-auth-id': 'usage-auth',
      'x-domain': 'usage.bitrix24.com'
    };

    const app = createTestApp();
    const res = await makeRequest(app, 'GET', '/api/admin/usage', usageHeaders);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.plan, 'basic');
    assert.strictEqual(res.body.monthlyUsage, 350);
    assert.strictEqual(res.body.quota, 1000);
  });
});
