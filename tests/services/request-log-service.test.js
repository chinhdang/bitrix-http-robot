const assert = require('assert');
const { describe, it, beforeEach } = require('node:test');

// Mock the db module
let mockQueryResults = [];
let mockQueryCalls = [];

const mockDb = {
  query: async (text, params) => {
    mockQueryCalls.push({ text, params });
    return mockQueryResults.shift() || { rows: [], rowCount: 0 };
  }
};

require.cache[require.resolve('../../db')] = {
  id: require.resolve('../../db'),
  exports: mockDb,
  loaded: true
};

const requestLogService = require('../../services/request-log-service');

describe('request-log-service', () => {
  beforeEach(() => {
    mockQueryResults = [];
    mockQueryCalls = [];
  });

  it('logRequest inserts a row', async () => {
    mockQueryResults.push({ rows: [], rowCount: 1 });

    await requestLogService.logRequest({
      accountId: 1,
      url: 'https://api.example.com/data',
      method: 'GET',
      statusCode: 200,
      success: true,
      executionTime: 150,
      errorMessage: null
    });

    assert.strictEqual(mockQueryCalls.length, 1);
    assert.ok(mockQueryCalls[0].text.includes('INSERT INTO request_logs'));
    assert.deepStrictEqual(mockQueryCalls[0].params, [1, 'https://api.example.com/data', 'GET', 200, true, 150, null]);
  });

  it('logRequest does not throw on error', async () => {
    mockQueryResults.push(Promise.reject(new Error('DB error')));
    // Mock query to throw
    const origQuery = mockDb.query;
    mockDb.query = async () => { throw new Error('DB error'); };

    await requestLogService.logRequest({
      accountId: 1, url: 'test', method: 'GET', statusCode: 200, success: true
    });
    // Should not throw
    mockDb.query = origQuery;
  });

  it('getMonthlyCount returns count', async () => {
    mockQueryResults.push({ rows: [{ count: 42 }], rowCount: 1 });

    const count = await requestLogService.getMonthlyCount(1);
    assert.strictEqual(count, 42);
    assert.ok(mockQueryCalls[0].text.includes("date_trunc('month'"));
  });

  it('getStats returns aggregated data', async () => {
    mockQueryResults.push({
      rows: [{
        total_requests: 100,
        success_count: 85,
        fail_count: 15,
        avg_response_time: 250
      }],
      rowCount: 1
    });

    const stats = await requestLogService.getStats(1);
    assert.strictEqual(stats.totalRequests, 100);
    assert.strictEqual(stats.successCount, 85);
    assert.strictEqual(stats.failCount, 15);
    assert.strictEqual(stats.avgResponseTime, 250);
  });

  it('getLog returns paginated data with filters', async () => {
    mockQueryResults.push({ rows: [{ total: 50 }], rowCount: 1 });
    mockQueryResults.push({ rows: [{ id: 1, url: 'test', method: 'POST' }], rowCount: 1 });

    const result = await requestLogService.getLog(1, { page: 1, limit: 20, method: 'POST' });
    assert.strictEqual(result.total, 50);
    assert.strictEqual(result.data.length, 1);
    assert.strictEqual(result.totalPages, 3);

    // Check that method filter was applied
    assert.ok(mockQueryCalls[0].text.includes('method = $2'));
    assert.ok(mockQueryCalls[0].params.includes('POST'));
  });

  it('getLog handles status filter', async () => {
    mockQueryResults.push({ rows: [{ total: 10 }], rowCount: 1 });
    mockQueryResults.push({ rows: [], rowCount: 0 });

    await requestLogService.getLog(1, { status: 'success' });
    assert.ok(mockQueryCalls[0].text.includes('success = true'));
  });

  it('getLog handles URL search filter', async () => {
    mockQueryResults.push({ rows: [{ total: 5 }], rowCount: 1 });
    mockQueryResults.push({ rows: [], rowCount: 0 });

    await requestLogService.getLog(1, { url: 'example' });
    assert.ok(mockQueryCalls[0].text.includes('ILIKE'));
    assert.ok(mockQueryCalls[0].params.includes('%example%'));
  });
});
