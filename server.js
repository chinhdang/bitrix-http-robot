const express = require('express');
const bodyParser = require('body-parser');
const { executeHttpRequest } = require('./handlers/executeHandler');
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

// Installation handlers (optional, for app lifecycle management)
app.post('/bitrix-handler/install', handleInstall);
app.post('/bitrix-handler/uninstall', handleUninstall);

// Placement handler for custom robot settings UI
app.post('/placement/robot-settings', handleRobotSettings);

// Test webhook endpoint - receives any request and logs it
const testWebhookLog = [];
app.all('/test-webhook', (req, res) => {
  const entry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body
  };
  testWebhookLog.push(entry);
  if (testWebhookLog.length > 50) testWebhookLog.shift();
  logger.info('Test webhook received', entry);
  res.json({ received: true, entry });
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
