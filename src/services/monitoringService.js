// Monitoring Service - Real-time system monitoring and alerting
class MonitoringService {
  constructor() {
    this.metrics = {
      performance: {
        pageLoadTime: 0,
        apiResponseTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        networkLatency: 0
      },
      security: {
        failedLogins: 0,
        suspiciousActivity: 0,
        blockedRequests: 0,
        lastSecurityScan: null
      },
      system: {
        uptime: 0,
        errorRate: 0,
        activeUsers: 0,
        databaseConnections: 0,
        cacheHitRate: 0
      },
      business: {
        dailyTransactions: 0,
        revenue: 0,
        customerSatisfaction: 0,
        conversionRate: 0
      }
    };

    this.alerts = [];
    this.thresholds = {
      performance: {
        pageLoadTime: 3000, // 3 seconds
        apiResponseTime: 1000, // 1 second
        memoryUsage: 80, // 80%
        networkLatency: 500 // 500ms
      },
      security: {
        failedLogins: 5, // per hour
        suspiciousActivity: 3, // per hour
        blockedRequests: 10 // per minute
      },
      system: {
        errorRate: 5, // 5%
        cacheHitRate: 70, // 70%
        databaseConnections: 90 // 90% of max
      }
    };

    this.monitoring = {
      enabled: true,
      interval: 60000, // 1 minute
      retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
      alertCooldown: 5 * 60 * 1000 // 5 minutes
    };

    this.observers = [];
    this.intervalIds = [];
    this.lastAlerts = new Map();

    this.initializeMonitoring();
  }

  // Initialize monitoring system
  initializeMonitoring() {
    if (!this.monitoring.enabled) {
      return;
    }

    // Setup performance monitoring
    this.setupPerformanceMonitoring();

    // Setup security monitoring
    this.setupSecurityMonitoring();

    // Setup system monitoring
    this.setupSystemMonitoring();

    // Setup business metrics monitoring
    this.setupBusinessMonitoring();

    // Setup real-time alerts
    this.setupRealTimeAlerts();

    // Setup data collection
    this.setupDataCollection();

    // Setup health checks
    this.setupHealthChecks();

    console.log('Monitoring service initialized');
  }

  // Setup performance monitoring
  setupPerformanceMonitoring() {
    // Monitor page load times
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          this.metrics.performance.pageLoadTime = entry.loadEventEnd - entry.loadEventStart;
          this.checkThreshold('performance', 'pageLoadTime', this.metrics.performance.pageLoadTime);
        }
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);
    }

    // Monitor API response times
    this.setupApiMonitoring();

    // Monitor memory usage
    this.setupMemoryMonitoring();

    // Monitor network latency
    this.setupNetworkMonitoring();
  }

  // Setup API monitoring
  setupApiMonitoring() {
    // Intercept fetch requests
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const startTime = performance.now();

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        // Update metrics
        this.metrics.performance.apiResponseTime = responseTime;
        this.checkThreshold('performance', 'apiResponseTime', responseTime);

        // Log API call
        this.logApiCall({
          url: args[0],
          method: args[1]?.method || 'GET',
          status: response.status,
          responseTime,
          timestamp: Date.now()
        });

        return response;
      } catch (error) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        // Log API error
        this.logApiError({
          url: args[0],
          method: args[1]?.method || 'GET',
          error: error.message,
          responseTime,
          timestamp: Date.now()
        });

        throw error;
      }
    };
  }

  // Setup memory monitoring
  setupMemoryMonitoring() {
    if ('memory' in performance) {
      const intervalId = setInterval(() => {
        const memory = performance.memory;
        const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

        this.metrics.performance.memoryUsage = usagePercentage;
        this.checkThreshold('performance', 'memoryUsage', usagePercentage);
      }, 30000); // Check every 30 seconds

      this.intervalIds.push(intervalId);
    }
  }

  // Setup network monitoring
  setupNetworkMonitoring() {
    const intervalId = setInterval(async () => {
      try {
        const startTime = performance.now();
        await fetch('/api/health', { method: 'HEAD' });
        const endTime = performance.now();
        const latency = endTime - startTime;

        this.metrics.performance.networkLatency = latency;
        this.checkThreshold('performance', 'networkLatency', latency);
      } catch (error) {
        console.warn('Network monitoring failed:', error);
      }
    }, 60000); // Check every minute

    this.intervalIds.push(intervalId);
  }

  // Setup security monitoring
  setupSecurityMonitoring() {
    // Monitor failed login attempts
    this.setupLoginMonitoring();

    // Monitor suspicious activity
    this.setupSuspiciousActivityMonitoring();

    // Monitor blocked requests
    this.setupBlockedRequestsMonitoring();

    // Setup security scans
    this.setupSecurityScans();
  }

  // Setup login monitoring
  setupLoginMonitoring() {
    // This would integrate with your authentication system
    window.addEventListener('login-failed', event => {
      this.metrics.security.failedLogins++;
      this.checkThreshold('security', 'failedLogins', this.metrics.security.failedLogins);

      this.logSecurityEvent({
        type: 'failed_login',
        details: event.detail,
        timestamp: Date.now()
      });
    });

    // Reset failed login counter hourly
    const intervalId = setInterval(
      () => {
        this.metrics.security.failedLogins = 0;
      },
      60 * 60 * 1000
    ); // 1 hour

    this.intervalIds.push(intervalId);
  }

  // Setup suspicious activity monitoring
  setupSuspiciousActivityMonitoring() {
    // Monitor for suspicious patterns
    const patterns = {
      rapidRequests: { count: 0, threshold: 100, window: 60000 }, // 100 requests per minute
      unusualPaths: { count: 0, threshold: 10, window: 300000 }, // 10 unusual paths per 5 minutes
      largePayloads: { count: 0, threshold: 5, window: 300000 } // 5 large payloads per 5 minutes
    };

    // Monitor request patterns
    const originalXHR = window.XMLHttpRequest;
    const requestTimes = [];

    window.XMLHttpRequest = function () {
      const xhr = new originalXHR();
      const originalSend = xhr.send;

      xhr.send = function (data) {
        const now = Date.now();
        requestTimes.push(now);

        // Clean old requests
        const cutoff = now - patterns.rapidRequests.window;
        while (requestTimes.length > 0 && requestTimes[0] < cutoff) {
          requestTimes.shift();
        }

        // Check for rapid requests
        if (requestTimes.length > patterns.rapidRequests.threshold) {
          this.detectSuspiciousActivity('rapid_requests', {
            count: requestTimes.length,
            threshold: patterns.rapidRequests.threshold
          });
        }

        // Check for large payloads
        if (data && data.length > 1024 * 1024) {
          // 1MB
          patterns.largePayloads.count++;
          if (patterns.largePayloads.count > patterns.largePayloads.threshold) {
            this.detectSuspiciousActivity('large_payloads', {
              count: patterns.largePayloads.count,
              size: data.length
            });
          }
        }

        return originalSend.call(this, data);
      }.bind(this);

      return xhr;
    }.bind(this);
  }

  // Detect suspicious activity
  detectSuspiciousActivity(type, details) {
    this.metrics.security.suspiciousActivity++;
    this.checkThreshold('security', 'suspiciousActivity', this.metrics.security.suspiciousActivity);

    this.logSecurityEvent({
      type: 'suspicious_activity',
      subtype: type,
      details,
      timestamp: Date.now()
    });
  }

  // Setup blocked requests monitoring
  setupBlockedRequestsMonitoring() {
    // This would integrate with your security service
    window.addEventListener('request-blocked', event => {
      this.metrics.security.blockedRequests++;
      this.checkThreshold('security', 'blockedRequests', this.metrics.security.blockedRequests);

      this.logSecurityEvent({
        type: 'blocked_request',
        details: event.detail,
        timestamp: Date.now()
      });
    });

    // Reset blocked requests counter every minute
    const intervalId = setInterval(() => {
      this.metrics.security.blockedRequests = 0;
    }, 60 * 1000); // 1 minute

    this.intervalIds.push(intervalId);
  }

  // Setup security scans
  setupSecurityScans() {
    const intervalId = setInterval(
      async () => {
        try {
          await this.performSecurityScan();
          this.metrics.security.lastSecurityScan = Date.now();
        } catch (error) {
          console.error('Security scan failed:', error);
        }
      },
      24 * 60 * 60 * 1000
    ); // Daily

    this.intervalIds.push(intervalId);
  }

  // Perform security scan
  async performSecurityScan() {
    const scan = {
      timestamp: Date.now(),
      checks: {
        csp: this.checkCSP(),
        https: this.checkHTTPS(),
        cookies: this.checkCookieSecurity(),
        localStorage: this.checkLocalStorageSecurity(),
        dependencies: await this.checkDependencySecurity()
      }
    };

    // Log scan results
    this.logSecurityEvent({
      type: 'security_scan',
      results: scan,
      timestamp: Date.now()
    });

    return scan;
  }

  // Check Content Security Policy
  checkCSP() {
    const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    return {
      enabled: metaTags.length > 0,
      policies: Array.from(metaTags).map(tag => tag.content)
    };
  }

  // Check HTTPS
  checkHTTPS() {
    return {
      enabled: location.protocol === 'https:',
      protocol: location.protocol
    };
  }

  // Check cookie security
  checkCookieSecurity() {
    const cookies = document.cookie.split(';');
    const insecureCookies = cookies.filter(cookie => {
      return !cookie.includes('Secure') || !cookie.includes('HttpOnly');
    });

    return {
      total: cookies.length,
      insecure: insecureCookies.length,
      secure: cookies.length - insecureCookies.length
    };
  }

  // Check localStorage security
  checkLocalStorageSecurity() {
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
    const items = Object.keys(localStorage);
    const potentiallyInsecure = items.filter(key =>
      sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
    );

    return {
      total: items.length,
      potentiallyInsecure: potentiallyInsecure.length,
      items: potentiallyInsecure
    };
  }

  // Check dependency security
  async checkDependencySecurity() {
    // This would check for known vulnerabilities in dependencies
    // For now, return a placeholder
    return {
      vulnerabilities: 0,
      lastCheck: Date.now()
    };
  }

  // Setup system monitoring
  setupSystemMonitoring() {
    // Monitor uptime
    this.startTime = Date.now();

    const intervalId = setInterval(() => {
      this.metrics.system.uptime = Date.now() - this.startTime;
    }, 60000); // Update every minute

    this.intervalIds.push(intervalId);

    // Monitor error rate
    this.setupErrorMonitoring();

    // Monitor active users (if available)
    this.setupUserMonitoring();

    // Monitor cache performance
    this.setupCacheMonitoring();
  }

  // Setup error monitoring
  setupErrorMonitoring() {
    let errorCount = 0;
    let totalRequests = 0;

    // Monitor JavaScript errors
    window.addEventListener('error', event => {
      errorCount++;
      this.updateErrorRate(errorCount, totalRequests);

      this.logSystemEvent({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now()
      });
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      errorCount++;
      this.updateErrorRate(errorCount, totalRequests);

      this.logSystemEvent({
        type: 'unhandled_rejection',
        reason: event.reason,
        timestamp: Date.now()
      });
    });

    // Track total requests (from API monitoring)
    window.addEventListener('api-request', () => {
      totalRequests++;
      this.updateErrorRate(errorCount, totalRequests);
    });

    // Reset counters hourly
    const intervalId = setInterval(
      () => {
        errorCount = 0;
        totalRequests = 0;
        this.metrics.system.errorRate = 0;
      },
      60 * 60 * 1000
    ); // 1 hour

    this.intervalIds.push(intervalId);
  }

  // Update error rate
  updateErrorRate(errorCount, totalRequests) {
    if (totalRequests > 0) {
      this.metrics.system.errorRate = (errorCount / totalRequests) * 100;
      this.checkThreshold('system', 'errorRate', this.metrics.system.errorRate);
    }
  }

  // Setup user monitoring
  setupUserMonitoring() {
    // This would integrate with your user session management
    // For now, use a simple approach
    const activeUsers = 1; // Current user

    const intervalId = setInterval(() => {
      // In a real application, this would query the server for active users
      this.metrics.system.activeUsers = activeUsers;
    }, 60000); // Update every minute

    this.intervalIds.push(intervalId);
  }

  // Setup cache monitoring
  setupCacheMonitoring() {
    let cacheHits = 0;
    let cacheMisses = 0;

    // Monitor cache performance (this would integrate with your cache service)
    window.addEventListener('cache-hit', () => {
      cacheHits++;
      this.updateCacheHitRate(cacheHits, cacheMisses);
    });

    window.addEventListener('cache-miss', () => {
      cacheMisses++;
      this.updateCacheHitRate(cacheHits, cacheMisses);
    });

    // Reset counters hourly
    const intervalId = setInterval(
      () => {
        cacheHits = 0;
        cacheMisses = 0;
        this.metrics.system.cacheHitRate = 0;
      },
      60 * 60 * 1000
    ); // 1 hour

    this.intervalIds.push(intervalId);
  }

  // Update cache hit rate
  updateCacheHitRate(hits, misses) {
    const total = hits + misses;
    if (total > 0) {
      this.metrics.system.cacheHitRate = (hits / total) * 100;
      this.checkThreshold('system', 'cacheHitRate', this.metrics.system.cacheHitRate);
    }
  }

  // Setup business monitoring
  setupBusinessMonitoring() {
    // This would integrate with your business logic
    const intervalId = setInterval(
      async () => {
        try {
          await this.updateBusinessMetrics();
        } catch (error) {
          console.error('Business metrics update failed:', error);
        }
      },
      5 * 60 * 1000
    ); // Update every 5 minutes

    this.intervalIds.push(intervalId);
  }

  // Update business metrics
  async updateBusinessMetrics() {
    // This would fetch real business data from your API
    // For now, use placeholder values
    this.metrics.business = {
      dailyTransactions: Math.floor(Math.random() * 1000),
      revenue: Math.floor(Math.random() * 100000),
      customerSatisfaction: 85 + Math.random() * 10,
      conversionRate: 2 + Math.random() * 3
    };
  }

  // Setup real-time alerts
  setupRealTimeAlerts() {
    // Setup WebSocket connection for real-time alerts (if available)
    this.setupWebSocketAlerts();

    // Setup push notifications
    this.setupPushNotifications();
  }

  // Setup WebSocket alerts
  setupWebSocketAlerts() {
    try {
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${location.host}/ws/monitoring`;

      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('Monitoring WebSocket connected');
      };

      this.websocket.onmessage = event => {
        try {
          const alert = JSON.parse(event.data);
          this.handleRealTimeAlert(alert);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('Monitoring WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          this.setupWebSocketAlerts();
        }, 5000);
      };

      this.websocket.onerror = error => {
        console.error('Monitoring WebSocket error:', error);
      };
    } catch (error) {
      console.warn('WebSocket not available for monitoring alerts');
    }
  }

  // Handle real-time alert
  handleRealTimeAlert(alert) {
    this.createAlert({
      ...alert,
      source: 'realtime',
      timestamp: Date.now()
    });
  }

  // Setup push notifications
  setupPushNotifications() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      // Request notification permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      });
    }
  }

  // Setup data collection
  setupDataCollection() {
    const intervalId = setInterval(() => {
      this.collectMetrics();
    }, this.monitoring.interval);

    this.intervalIds.push(intervalId);
  }

  // Collect metrics
  collectMetrics() {
    const timestamp = Date.now();
    const snapshot = {
      timestamp,
      metrics: JSON.parse(JSON.stringify(this.metrics))
    };

    // Store metrics in IndexedDB
    this.storeMetrics(snapshot);

    // Cleanup old metrics
    this.cleanupOldMetrics();
  }

  // Store metrics in IndexedDB
  async storeMetrics(snapshot) {
    try {
      const db = await this.openMetricsDB();
      const transaction = db.transaction(['metrics'], 'readwrite');
      const store = transaction.objectStore('metrics');

      await store.add(snapshot);
    } catch (error) {
      console.error('Failed to store metrics:', error);
    }
  }

  // Open metrics database
  openMetricsDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('QASDMetrics', 1);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('metrics')) {
          const store = db.createObjectStore('metrics', { keyPath: 'timestamp' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
    });
  }

  // Cleanup old metrics
  async cleanupOldMetrics() {
    try {
      const cutoff = Date.now() - this.monitoring.retentionPeriod;
      const db = await this.openMetricsDB();
      const transaction = db.transaction(['metrics'], 'readwrite');
      const store = transaction.objectStore('metrics');
      const index = store.index('timestamp');

      const range = IDBKeyRange.upperBound(cutoff);
      const request = index.openCursor(range);

      request.onsuccess = event => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    } catch (error) {
      console.error('Failed to cleanup old metrics:', error);
    }
  }

  // Setup health checks
  setupHealthChecks() {
    const intervalId = setInterval(
      async () => {
        try {
          await this.performHealthCheck();
        } catch (error) {
          console.error('Health check failed:', error);
        }
      },
      5 * 60 * 1000
    ); // Every 5 minutes

    this.intervalIds.push(intervalId);
  }

  // Perform health check
  async performHealthCheck() {
    const healthCheck = {
      timestamp: Date.now(),
      status: 'healthy',
      checks: {
        api: await this.checkApiHealth(),
        database: await this.checkDatabaseHealth(),
        cache: await this.checkCacheHealth(),
        storage: await this.checkStorageHealth()
      }
    };

    // Determine overall health
    const failedChecks = Object.values(healthCheck.checks).filter(check => !check.healthy);
    if (failedChecks.length > 0) {
      healthCheck.status = failedChecks.length > 2 ? 'critical' : 'warning';

      this.createAlert({
        type: 'health_check',
        severity: healthCheck.status,
        message: `Health check failed: ${failedChecks.length} checks failed`,
        details: healthCheck,
        timestamp: Date.now()
      });
    }

    this.logSystemEvent({
      type: 'health_check',
      status: healthCheck.status,
      details: healthCheck,
      timestamp: Date.now()
    });

    return healthCheck;
  }

  // Check API health
  async checkApiHealth() {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/health');
      const endTime = performance.now();

      return {
        healthy: response.ok,
        responseTime: endTime - startTime,
        status: response.status
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  // Check database health
  async checkDatabaseHealth() {
    try {
      // This would check your database connection
      // For now, check IndexedDB
      const db = await this.openMetricsDB();
      db.close();

      return {
        healthy: true,
        type: 'IndexedDB'
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  // Check cache health
  async checkCacheHealth() {
    try {
      // Check if cache is working
      const testKey = 'health_check_' + Date.now();
      const testValue = 'test';

      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      return {
        healthy: retrieved === testValue,
        type: 'localStorage'
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  // Check storage health
  async checkStorageHealth() {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usagePercentage = (estimate.usage / estimate.quota) * 100;

        return {
          healthy: usagePercentage < 90,
          usage: estimate.usage,
          quota: estimate.quota,
          usagePercentage
        };
      } else {
        return {
          healthy: true,
          message: 'Storage API not available'
        };
      }
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  // Check threshold
  checkThreshold(category, metric, value) {
    const threshold = this.thresholds[category]?.[metric];
    if (!threshold) {
      return;
    }

    const alertKey = `${category}_${metric}`;
    const lastAlert = this.lastAlerts.get(alertKey);
    const now = Date.now();

    // Check cooldown
    if (lastAlert && now - lastAlert < this.monitoring.alertCooldown) {
      return;
    }

    let exceeded = false;
    let severity = 'warning';

    // Check if threshold is exceeded
    if (category === 'system' && metric === 'cacheHitRate') {
      exceeded = value < threshold; // Lower is worse for cache hit rate
    } else {
      exceeded = value > threshold;
    }

    if (exceeded) {
      // Determine severity
      if (value > threshold * 1.5) {
        severity = 'critical';
      } else if (value > threshold * 1.2) {
        severity = 'high';
      }

      this.createAlert({
        type: 'threshold_exceeded',
        category,
        metric,
        value,
        threshold,
        severity,
        message: `${category}.${metric} exceeded threshold: ${value} > ${threshold}`,
        timestamp: now
      });

      this.lastAlerts.set(alertKey, now);
    }
  }

  // Create alert
  createAlert(alert) {
    const alertWithId = {
      id: this.generateAlertId(),
      ...alert,
      acknowledged: false,
      resolved: false
    };

    this.alerts.unshift(alertWithId);

    // Limit alerts array size
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(0, 1000);
    }

    // Send notification
    this.sendNotification(alertWithId);

    // Log alert
    this.logAlert(alertWithId);

    // Emit event
    window.dispatchEvent(
      new CustomEvent('monitoring-alert', {
        detail: alertWithId
      })
    );

    console.warn('Alert created:', alertWithId);
  }

  // Generate alert ID
  generateAlertId() {
    return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Send notification
  sendNotification(alert) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`QASD Alert: ${alert.type}`, {
        body: alert.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: alert.id,
        requireInteraction: alert.severity === 'critical'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 10 seconds for non-critical alerts
      if (alert.severity !== 'critical') {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }
    }
  }

  // Log API call
  logApiCall(data) {
    this.logEvent('api_call', data);
    window.dispatchEvent(new CustomEvent('api-request'));
  }

  // Log API error
  logApiError(data) {
    this.logEvent('api_error', data);
  }

  // Log security event
  logSecurityEvent(data) {
    this.logEvent('security', data);
  }

  // Log system event
  logSystemEvent(data) {
    this.logEvent('system', data);
  }

  // Log alert
  logAlert(alert) {
    this.logEvent('alert', alert);
  }

  // Log event
  logEvent(type, data) {
    const logEntry = {
      timestamp: Date.now(),
      type,
      data
    };

    // Store in IndexedDB
    this.storeLogEntry(logEntry);
  }

  // Store log entry
  async storeLogEntry(logEntry) {
    try {
      const db = await this.openLogsDB();
      const transaction = db.transaction(['logs'], 'readwrite');
      const store = transaction.objectStore('logs');

      await store.add(logEntry);
    } catch (error) {
      console.error('Failed to store log entry:', error);
    }
  }

  // Open logs database
  openLogsDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('QASDLogs', 1);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('logs')) {
          const store = db.createObjectStore('logs', { keyPath: 'timestamp' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
    });
  }

  // Get metrics history
  async getMetricsHistory(timeRange = 24 * 60 * 60 * 1000) {
    try {
      const cutoff = Date.now() - timeRange;
      const db = await this.openMetricsDB();
      const transaction = db.transaction(['metrics'], 'readonly');
      const store = transaction.objectStore('metrics');
      const index = store.index('timestamp');

      const range = IDBKeyRange.lowerBound(cutoff);
      const request = index.getAll(range);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get metrics history:', error);
      return [];
    }
  }

  // Get logs
  async getLogs(type = null, timeRange = 24 * 60 * 60 * 1000) {
    try {
      const cutoff = Date.now() - timeRange;
      const db = await this.openLogsDB();
      const transaction = db.transaction(['logs'], 'readonly');
      const store = transaction.objectStore('logs');

      let request;
      if (type) {
        const index = store.index('type');
        request = index.getAll(type);
      } else {
        const index = store.index('timestamp');
        const range = IDBKeyRange.lowerBound(cutoff);
        request = index.getAll(range);
      }

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const logs = request.result.filter(log => log.timestamp >= cutoff);
          resolve(logs);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get logs:', error);
      return [];
    }
  }

  // Get current metrics
  getCurrentMetrics() {
    return JSON.parse(JSON.stringify(this.metrics));
  }

  // Get alerts
  getAlerts(filter = null) {
    if (!filter) {
      return [...this.alerts];
    }

    return this.alerts.filter(alert => {
      if (filter.severity && alert.severity !== filter.severity) {
        return false;
      }
      if (filter.type && alert.type !== filter.type) {
        return false;
      }
      if (filter.acknowledged !== undefined && alert.acknowledged !== filter.acknowledged) {
        return false;
      }
      if (filter.resolved !== undefined && alert.resolved !== filter.resolved) {
        return false;
      }
      return true;
    });
  }

  // Acknowledge alert
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = Date.now();

      this.logEvent('alert_acknowledged', { alertId, timestamp: Date.now() });
    }
  }

  // Resolve alert
  resolveAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();

      this.logEvent('alert_resolved', { alertId, timestamp: Date.now() });
    }
  }

  // Get monitoring status
  getMonitoringStatus() {
    return {
      enabled: this.monitoring.enabled,
      uptime: Date.now() - this.startTime,
      metricsCollected: this.metrics,
      alertsCount: this.alerts.length,
      unacknowledgedAlerts: this.alerts.filter(a => !a.acknowledged).length,
      unresolvedAlerts: this.alerts.filter(a => !a.resolved).length,
      lastHealthCheck: this.lastHealthCheck,
      observers: this.observers.length,
      intervals: this.intervalIds.length
    };
  }

  // Stop monitoring
  stopMonitoring() {
    this.monitoring.enabled = false;

    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    // Clear intervals
    this.intervalIds.forEach(id => clearInterval(id));
    this.intervalIds = [];

    // Close WebSocket
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    console.log('Monitoring stopped');
  }

  // Restart monitoring
  restartMonitoring() {
    this.stopMonitoring();
    this.monitoring.enabled = true;
    this.initializeMonitoring();
    console.log('Monitoring restarted');
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  monitoringService.stopMonitoring();
});

export default monitoringService;
