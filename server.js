const express = require('express');
const bodyParser = require('body-parser');
const { executeHttpRequest, extractJsonPath, buildRequestHeaders, buildRequestBody } = require('./handlers/executeHandler');
const { handleInstall, handleUninstall } = require('./handlers/installHandler');
const { handleRobotSettings } = require('./handlers/placementHandler');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// Routes
// Main handler for robot/activity execution
app.post('/bitrix-handler/execute', executeHttpRequest);

// Test request endpoint - sends HTTP request and returns response preview
app.post('/bitrix-handler/test', async (req, res) => {
  const startTime = Date.now();

  try {
    const { config } = req.body;
    if (!config || !config.url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    // Check if config contains Bitrix variables
    const configString = JSON.stringify(config);
    const hasVariables = /\{=\w+:\w+\}/.test(configString);

    const headers = buildRequestHeaders(config);
    const requestBody = buildRequestBody(config, headers);

    const requestConfig = {
      url: config.url,
      method: config.method || 'GET',
      headers: headers,
      body: requestBody,
      timeout: parseInt(config.timeout) || 30000
    };

    const response = await require('./services/httpRequest').makeHttpRequest(requestConfig);
    const executionTime = Date.now() - startTime;

    // Parse response body
    let responseBodyParsed = null;
    if (typeof response.data === 'object') {
      responseBodyParsed = response.data;
    } else if (typeof response.data === 'string') {
      try { responseBodyParsed = JSON.parse(response.data); } catch (e) { /* not JSON */ }
    }

    // Extract output mappings
    const outputMappings = [];
    if (config.outputMappings && Array.isArray(config.outputMappings) && responseBodyParsed) {
      config.outputMappings.forEach(mapping => {
        if (mapping.path && mapping.output) {
          try {
            const value = extractJsonPath(responseBodyParsed, mapping.path);
            outputMappings.push({
              output: mapping.output,
              path: mapping.path,
              value: value !== undefined ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : null,
              label: mapping.label || ''
            });
          } catch (e) {
            outputMappings.push({ output: mapping.output, path: mapping.path, value: null, label: mapping.label || '' });
          }
        }
      });
    }

    res.json({
      success: true,
      statusCode: response.status,
      statusText: response.statusText || '',
      responseHeaders: response.headers || {},
      responseBody: typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : String(response.data || ''),
      responseBodyParsed,
      outputMappings,
      executionTime,
      hasVariables
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    logger.error('Test request failed', { error: error.message });
    res.json({
      success: false,
      error: error.message,
      executionTime
    });
  }
});

// Installation handlers (optional, for app lifecycle management)
app.post('/bitrix-handler/install', handleInstall);
app.post('/bitrix-handler/uninstall', handleUninstall);

// Placement handler for custom robot settings UI
app.post('/placement/robot-settings', handleRobotSettings);

// Test webhook endpoint - receives any request and returns structured response
const testWebhookLog = [];
app.all('/test-webhook', (req, res) => {
  const entry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    query: req.query,
    body: req.body,
    hasBody: Object.keys(req.body || {}).length > 0
  };
  testWebhookLog.push(entry);
  if (testWebhookLog.length > 50) testWebhookLog.shift();
  logger.info('Test webhook received', entry);

  // Return structured response that Bitrix robot can capture
  res.json({
    success: true,
    message: 'Webhook received successfully',
    data: {
      order_id: 'ORD-' + Date.now(),
      status: 'processed',
      received_method: req.method,
      received_body: req.body,
      received_query: req.query,
      processed_at: new Date().toISOString()
    }
  });
});

// View test webhook log
app.get('/test-webhook/log', (req, res) => {
  res.json({ count: testWebhookLog.length, entries: testWebhookLog });
});

// Clear test webhook log
app.delete('/test-webhook/log', (req, res) => {
  testWebhookLog.length = 0;
  res.json({ cleared: true });
});

// Debug endpoint - shows last PLACEMENT_OPTIONS received (document_fields, etc.)
app.get('/debug/placement', (req, res) => {
  res.json(app.locals.lastPlacementOptions || { message: 'No placement data yet. Open robot settings first.' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Bitrix24 HTTP Request Robot',
    version: '1.0.0',
    status: 'running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
// Bind to 0.0.0.0 for Railway/Docker compatibility
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  logger.info(`Bitrix24 HTTP Request Robot handler running on ${HOST}:${PORT}`, {
    host: HOST,
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
