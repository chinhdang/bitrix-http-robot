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

// Replace require for db
require.cache[require.resolve('../../db')] = {
  id: require.resolve('../../db'),
  exports: mockDb,
  loaded: true
};

const accountService = require('../../services/account-service');

describe('account-service', () => {
  beforeEach(() => {
    mockQueryResults = [];
    mockQueryCalls = [];
  });

  it('upsertAccount inserts or updates and returns row', async () => {
    const fakeAccount = { id: 1, member_id: 'abc123', domain: 'test.bitrix24.com', plan: 'free' };
    mockQueryResults.push({ rows: [fakeAccount], rowCount: 1 });

    const result = await accountService.upsertAccount('abc123', 'test.bitrix24.com');
    assert.strictEqual(result.id, 1);
    assert.strictEqual(result.member_id, 'abc123');
    assert.ok(mockQueryCalls[0].text.includes('INSERT INTO accounts'));
    assert.ok(mockQueryCalls[0].text.includes('ON CONFLICT'));
  });

  it('getByMemberId returns account if found', async () => {
    const fakeAccount = { id: 1, member_id: 'abc123', domain: 'test.bitrix24.com', plan: 'free' };
    mockQueryResults.push({ rows: [fakeAccount], rowCount: 1 });

    const result = await accountService.getByMemberId('abc123');
    assert.strictEqual(result.member_id, 'abc123');
    assert.deepStrictEqual(mockQueryCalls[0].params, ['abc123']);
  });

  it('getByMemberId returns null if not found', async () => {
    mockQueryResults.push({ rows: [], rowCount: 0 });

    const result = await accountService.getByMemberId('nonexistent');
    assert.strictEqual(result, null);
  });

  it('getOrCreate returns existing account', async () => {
    const fakeAccount = { id: 1, member_id: 'abc123', domain: 'test.bitrix24.com', plan: 'free' };
    mockQueryResults.push({ rows: [fakeAccount], rowCount: 1 });

    const result = await accountService.getOrCreate('abc123', 'test.bitrix24.com');
    assert.strictEqual(result.id, 1);
    assert.strictEqual(mockQueryCalls.length, 1); // Only one query (getByMemberId)
  });

  it('getOrCreate creates new account if not found', async () => {
    const fakeAccount = { id: 2, member_id: 'new123', domain: 'new.bitrix24.com', plan: 'free' };
    mockQueryResults.push({ rows: [], rowCount: 0 }); // getByMemberId returns nothing
    mockQueryResults.push({ rows: [fakeAccount], rowCount: 1 }); // upsertAccount returns new row

    const result = await accountService.getOrCreate('new123', 'new.bitrix24.com');
    assert.strictEqual(result.id, 2);
    assert.strictEqual(mockQueryCalls.length, 2);
  });

  it('updatePlan updates and returns account', async () => {
    const fakeAccount = { id: 1, member_id: 'abc123', domain: 'test.bitrix24.com', plan: 'pro' };
    mockQueryResults.push({ rows: [fakeAccount], rowCount: 1 });

    const result = await accountService.updatePlan('abc123', 'pro');
    assert.strictEqual(result.plan, 'pro');
    assert.ok(mockQueryCalls[0].text.includes('UPDATE accounts'));
  });
});
