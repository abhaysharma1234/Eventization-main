import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level (can be set via environment variable)
const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, 'app.log');
    this.errorLogFile = path.join(logsDir, 'error.log');
    this.accessLogFile = path.join(logsDir, 'access.log');
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaString}`;
  }

  writeToFile(filename, message) {
    try {
      fs.appendFileSync(filename, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= currentLogLevel;
  }

  error(message, meta = {}) {
    if (this.shouldLog('ERROR')) {
      const formattedMessage = this.formatMessage('ERROR', message, meta);
      console.error(`\x1b[31m${formattedMessage}\x1b[0m`);
      this.writeToFile(this.logFile, formattedMessage);
      this.writeToFile(this.errorLogFile, formattedMessage);
    }
  }

  warn(message, meta = {}) {
    if (this.shouldLog('WARN')) {
      const formattedMessage = this.formatMessage('WARN', message, meta);
      console.warn(`\x1b[33m${formattedMessage}\x1b[0m`);
      this.writeToFile(this.logFile, formattedMessage);
    }
  }

  info(message, meta = {}) {
    if (this.shouldLog('INFO')) {
      const formattedMessage = this.formatMessage('INFO', message, meta);
      console.info(`\x1b[36m${formattedMessage}\x1b[0m`);
      this.writeToFile(this.logFile, formattedMessage);
    }
  }

  debug(message, meta = {}) {
    if (this.shouldLog('DEBUG')) {
      const formattedMessage = this.formatMessage('DEBUG', message, meta);
      console.debug(`\x1b[37m${formattedMessage}\x1b[0m`);
      this.writeToFile(this.logFile, formattedMessage);
    }
  }

  // HTTP request logging
  logRequest(req, res, responseTime) {
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`;
    const meta = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    };
    
    const formattedMessage = this.formatMessage('ACCESS', message, meta);
    this.writeToFile(this.accessLogFile, formattedMessage);
    
    if (res.statusCode >= 400) {
      this.error(message, meta);
    } else {
      this.info(message, meta);
    }
  }

  // Database operation logging
  logDatabase(operation, collection, query = {}, result = {}) {
    const message = `DB ${operation} on ${collection}`;
    const meta = { query, resultCount: result.length || 1 };
    this.debug(message, meta);
  }

  // Security event logging
  logSecurity(event, details = {}) {
    const message = `SECURITY: ${event}`;
    this.warn(message, details);
  }

  // Performance logging
  logPerformance(operation, duration, details = {}) {
    const message = `PERFORMANCE: ${operation} took ${duration}ms`;
    const meta = { ...details, duration };
    
    if (duration > 1000) {
      this.warn(message, meta);
    } else {
      this.debug(message, meta);
    }
  }
}

export const logger = new Logger();

// Request timing middleware
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);
  });
  
  next();
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });
  
  next(err);
};

export default logger;
