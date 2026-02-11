const assert = require('assert');
const { describe, it, beforeEach } = require('node:test');

// Mock the db module
let mockQueryResults = [];
const mockDb = {
  query: async (text, params) => {
    return mockQueryResults.shift() || { rows: [], rowCount: 0 };
  }
};

require.cache[require.resolve('../../db')] = {
  id: require.resolve('../../db'),
  exports: mockDb,
  loaded: true
};

// Clear cached services to ensure they use our mock
delete require.cache[require.resolve('../../services/account-service')];
delete require.cache[require.resolve('../../services/request-log-service')];
delete require.cache[require.resolve('../../services/quota-service')];

const quotaService = require('../../services/quota-service');

describe('quota-service', () => {
  beforeEach(() => {
    mockQueryResults = [];
  });

  it('PLAN_LIMITS has expected values', () => {
    assert.strictEqual(quotaService.PLAN_LIMITS.free, 100);
    assert.strictEqual(quotaService.PLAN_LIMITS.basic, 1000);
    assert.strictEqual(quotaService.PLAN_LIMITS.pro, 10000);
    assert.strictEqual(quotaService.PLAN_LIMITS.enterprise, Infinity);
  });

  it('checkQuota allows when under limit', async () => {
    const fakeAccount = { id: 1, member_id: 'abc', domain: 'test.bitrix24.com', plan: 'free' };
    mockQueryResults.push({ rows: [fakeAccount], rowCount: 1 }); // getByMemberId
    mockQueryResults.push({ rows: [{ count: 50 }], rowCount: 1 }); // getMonthlyCount

    const result = await quotaService.checkQuota('abc', 'test.bitrix24.com');
    assert.strictEqual(result.allowed, true);
    assert.strictEqual(result.usage, 50);
    assert.strictEqual(result.quota, 100);
    assert.strictEqual(result.plan, 'free');
  });

  it('checkQuota blocks when over limit', async () => {
    const fakeAccount = { id: 1, member_id: 'abc', domain: 'test.bitrix24.com', plan: 'free' };
    mockQueryResults.push({ rows: [fakeAccount], rowCount: 1 });
    mockQueryResults.push({ rows: [{ count: 100 }], rowCount: 1 });

    const result = await quotaService.checkQuota('abc', 'test.bitrix24.com');
    assert.strictEqual(result.allowed, false);
    assert.strictEqual(result.usage, 100);
  });

  it('checkQuota fails open on DB error', async () => {
    // Make query throw
    const origQuery = mockDb.query;
    mockDb.query = async () => { throw new Error('DB down'); };

    const result = await quotaService.checkQuota('abc', 'test.bitrix24.com');
    assert.strictEqual(result.allowed, true);

    mockDb.query = origQuery;
  });

  it('getUsage returns usage info', async () => {
    const fakeAccount = { id: 1, member_id: 'abc', domain: 'test.bitrix24.com', plan: 'basic', installed_at: '2026-01-01' };
    mockQueryResults.push({ rows: [fakeAccount], rowCount: 1 }); // getByMemberId
    mockQueryResults.push({ rows: [{ count: 250 }], rowCount: 1 }); // getMonthlyCount

    const result = await quotaService.getUsage('abc');
    assert.strictEqual(result.plan, 'basic');
    assert.strictEqual(result.monthlyUsage, 250);
    assert.strictEqual(result.quota, 1000);
  });

  it('getUsage returns null for unknown member', async () => {
    mockQueryResults.push({ rows: [], rowCount: 0 });

    const result = await quotaService.getUsage('nonexistent');
    assert.strictEqual(result, null);
  });
});
