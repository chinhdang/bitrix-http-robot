/**
 * Simple logging utility
 */

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message
  };

  if (data) {
    logEntry.data = data;
  }

  console.log(JSON.stringify(logEntry));
}

function info(message, data = null) {
  log('INFO', message, data);
}

function error(message, data = null) {
  log('ERROR', message, data);
}

function warn(message, data = null) {
  log('WARN', message, data);
}

function debug(message, data = null) {
  if (process.env.NODE_ENV === 'development') {
    log('DEBUG', message, data);
  }
}

module.exports = {
  info,
  error,
  warn,
  debug
};
