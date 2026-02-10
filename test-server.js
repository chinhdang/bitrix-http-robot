/**
 * Test script to verify server functionality
 * Run with: node test-server.js
 */

const axios = require('axios');

const SERVER_URL = process.env.TEST_SERVER_URL || 'http://localhost:3000';

// Mock Bitrix24 request data
const mockBitrix24Request = {
  event_token: 'test_event_token_123',
  properties: {
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    method: 'GET',
    headers: '{"Content-Type": "application/json"}',
    body: '',
    timeout: 30000
  },
  auth: {
    domain: 'test.bitrix24.com',
    access_token: 'test_token'
  },
  document_id: [123, 'CCrmDocumentDeal'],
  document_type: ['crm', 'CCrmDocumentDeal']
};

async function testHealthCheck() {
  console.log('\n=== Testing Health Check ===');
  try {
    const response = await axios.get(`${SERVER_URL}/health`);
    console.log('✅ Health check passed');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testRootEndpoint() {
  console.log('\n=== Testing Root Endpoint ===');
  try {
    const response = await axios.get(`${SERVER_URL}/`);
    console.log('✅ Root endpoint works');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Root endpoint failed:', error.message);
    return false;
  }
}

async function testExecuteHandler() {
  console.log('\n=== Testing Execute Handler ===');
  console.log('Request data:', JSON.stringify(mockBitrix24Request, null, 2));

  try {
    const response = await axios.post(
      `${SERVER_URL}/bitrix-handler/execute`,
      mockBitrix24Request
    );
    console.log('✅ Execute handler works');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Execute handler failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

async function testWithPOST() {
  console.log('\n=== Testing POST Request ===');

  const postRequest = {
    ...mockBitrix24Request,
    properties: {
      url: 'https://jsonplaceholder.typicode.com/posts',
      method: 'POST',
      headers: '{"Content-Type": "application/json"}',
      body: '{"title": "Test Post", "body": "Test content", "userId": 1}',
      timeout: 30000
    }
  };

  try {
    const response = await axios.post(
      `${SERVER_URL}/bitrix-handler/execute`,
      postRequest
    );
    console.log('✅ POST request works');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ POST request failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

async function testInvalidURL() {
  console.log('\n=== Testing Invalid URL Handling ===');

  const invalidRequest = {
    ...mockBitrix24Request,
    properties: {
      url: 'not-a-valid-url',
      method: 'GET',
      headers: '',
      body: '',
      timeout: 30000
    }
  };

  try {
    const response = await axios.post(
      `${SERVER_URL}/bitrix-handler/execute`,
      invalidRequest
    );

    // Should return error in response
    if (response.data.success === false) {
      console.log('✅ Invalid URL properly handled');
      console.log('Error:', response.data.error);
      return true;
    } else {
      console.error('❌ Invalid URL not properly handled');
      return false;
    }
  } catch (error) {
    // This is expected
    console.log('✅ Invalid URL properly rejected');
    return true;
  }
}

async function testTimeout() {
  console.log('\n=== Testing Timeout Handling ===');

  const timeoutRequest = {
    ...mockBitrix24Request,
    properties: {
      url: 'https://httpbin.org/delay/5', // 5 second delay
      method: 'GET',
      headers: '',
      body: '',
      timeout: 2000 // 2 second timeout
    }
  };

  try {
    const response = await axios.post(
      `${SERVER_URL}/bitrix-handler/execute`,
      timeoutRequest,
      { timeout: 10000 } // Give server time to respond
    );

    console.log('✅ Timeout handled');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Timeout test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('='.repeat(60));
  console.log('HTTP Request Robot - Server Tests');
  console.log('='.repeat(60));
  console.log(`Testing server at: ${SERVER_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);

  const results = {
    healthCheck: await testHealthCheck(),
    rootEndpoint: await testRootEndpoint(),
    executeHandler: await testExecuteHandler(),
    postRequest: await testWithPOST(),
    invalidURL: await testInvalidURL(),
    timeout: await testTimeout()
  };

  console.log('\n' + '='.repeat(60));
  console.log('Test Results Summary');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  for (const [test, result] of Object.entries(results)) {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${test}`);
    if (result) passed++;
    else failed++;
  }

  console.log('='.repeat(60));
  console.log(`Total: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the output above.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
