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
app.listen(PORT, () => {
  logger.info(`Bitrix24 HTTP Request Robot handler running on port ${PORT}`, {
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
