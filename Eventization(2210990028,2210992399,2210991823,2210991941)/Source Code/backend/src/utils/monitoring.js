import { logger } from './logger.js';

class MonitoringService {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byEndpoint: {},
        byStatus: {}
      },
      performance: {
        averageResponseTime: 0,
        slowQueries: [],
        memoryUsage: []
      },
      security: {
        failedAuthAttempts: 0,
        suspiciousRequests: 0,
        blockedIPs: new Set()
      },
      database: {
        connections: 0,
        queries: 0,
        errors: 0
      }
    };
    
    // Start monitoring intervals
    this.startMetricsCollection();
  }

  startMetricsCollection() {
    // Collect system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Clean old metrics every hour
    setInterval(() => {
      this.cleanOldMetrics();
    }, 3600000);
  }

  collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    this.metrics.performance.memoryUsage.push({
      timestamp: new Date().toISOString(),
      rss: memUsage.rss,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external
    });

    // Keep only last 100 entries
    if (this.metrics.performance.memoryUsage.length > 100) {
      this.metrics.performance.memoryUsage.shift();
    }

    logger.debug('System metrics collected', { memory: memUsage });
  }

  cleanOldMetrics() {
    // Keep only last 24 hours of data
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    this.metrics.performance.slowQueries = this.metrics.performance.slowQueries.filter(
      query => new Date(query.timestamp) > cutoff
    );
  }

  // Request metrics
  recordRequest(req, res, responseTime) {
    this.metrics.requests.total++;
    
    if (res.statusCode < 400) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }

    // Track by endpoint
    const endpoint = req.route?.path || req.originalUrl;
    this.metrics.requests.byEndpoint[endpoint] = (this.metrics.requests.byEndpoint[endpoint] || 0) + 1;

    // Track by status
    this.metrics.requests.byStatus[res.statusCode] = (this.metrics.requests.byStatus[res.statusCode] || 0) + 1;

    // Track slow requests
    if (responseTime > 1000) {
      this.metrics.performance.slowQueries.push({
        timestamp: new Date().toISOString(),
        endpoint,
        method: req.method,
        responseTime,
        statusCode: res.statusCode
      });
    }

    // Update average response time
    this.updateAverageResponseTime(responseTime);
  }

  updateAverageResponseTime(responseTime) {
    const total = this.metrics.requests.total;
    const current = this.metrics.performance.averageResponseTime;
    this.metrics.performance.averageResponseTime = (current * (total - 1) + responseTime) / total;
  }

  // Security metrics
  recordFailedAuth(ip, endpoint) {
    this.metrics.security.failedAuthAttempts++;
    logger.logSecurity('Failed authentication attempt', { ip, endpoint });
    
    // Check for brute force attempts
    if (this.metrics.security.failedAuthAttempts % 5 === 0) {
      logger.warn('Multiple failed auth attempts detected', { ip, attempts: this.metrics.security.failedAuthAttempts });
    }
  }

  recordSuspiciousRequest(req, reason) {
    this.metrics.security.suspiciousRequests++;
    logger.logSecurity('Suspicious request detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      reason
    });
  }

  recordBlockedIP(ip) {
    this.metrics.security.blockedIPs.add(ip);
    logger.logSecurity('IP blocked', { ip });
  }

  // Database metrics
  recordDatabaseQuery(operation, collection, duration) {
    this.metrics.database.queries++;
    
    if (duration > 500) {
      logger.logPerformance(`Slow DB query: ${operation} on ${collection}`, duration);
    }
  }

  recordDatabaseError(error, operation, collection) {
    this.metrics.database.errors++;
    logger.error(`Database error in ${operation} on ${collection}`, { error: error.message });
  }

  // Health check
  getHealthStatus() {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB'
      },
      metrics: {
        requests: this.metrics.requests,
        performance: {
          averageResponseTime: Math.round(this.metrics.performance.averageResponseTime) + 'ms',
          slowQueriesCount: this.metrics.performance.slowQueries.length,
          memoryUsagePoints: this.metrics.performance.memoryUsage.length
        },
        security: {
          failedAuthAttempts: this.metrics.security.failedAuthAttempts,
          suspiciousRequests: this.metrics.security.suspiciousRequests,
          blockedIPs: this.metrics.security.blockedIPs.size
        },
        database: this.metrics.database
      }
    };
  }

  // Get metrics for monitoring dashboard
  getMetrics() {
    return {
      ...this.metrics,
      security: {
        ...this.metrics.security,
        blockedIPs: Array.from(this.metrics.security.blockedIPs)
      }
    };
  }

  // Alert on threshold breaches
  checkThresholds() {
    const metrics = this.metrics;
    
    // High error rate
    if (metrics.requests.total > 100 && metrics.requests.failed / metrics.requests.total > 0.1) {
      logger.warn('High error rate detected', {
        errorRate: (metrics.requests.failed / metrics.requests.total * 100).toFixed(2) + '%'
      });
    }

    // High response time
    if (metrics.performance.averageResponseTime > 2000) {
      logger.warn('High average response time detected', {
        averageResponseTime: metrics.performance.averageResponseTime + 'ms'
      });
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    if (memoryUsagePercent > 80) {
      logger.warn('High memory usage detected', {
        memoryUsage: memoryUsagePercent.toFixed(2) + '%'
      });
    }
  }
}

export const monitoring = new MonitoringService();

// Auto-check thresholds every 5 minutes
setInterval(() => {
  monitoring.checkThresholds();
}, 300000);

export default monitoring;
