/**
 * Production Optimization Service
 * Comprehensive production-ready features and optimizations
 */

import CryptoJS from 'crypto-js';

class ProductionOptimizationService {
  constructor() {
    this.isInitialized = false;
    this.config = {
      environment: import.meta.env.MODE || 'development',
      apiUrl: import.meta.env.VITE_API_URL || '',
      enableLogging: import.meta.env.VITE_ENABLE_LOGGING !== 'false',
      enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
      enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING !== 'false',
      cacheTimeout: parseInt(import.meta.env.VITE_CACHE_TIMEOUT) || 300000, // 5 minutes
      maxRetries: parseInt(import.meta.env.VITE_MAX_RETRIES) || 3,
      retryDelay: parseInt(import.meta.env.VITE_RETRY_DELAY) || 1000
    };

    this.cache = new Map();
    this.errorQueue = [];
    this.performanceMetrics = {
      apiCalls: [],
      pageLoads: [],
      userInteractions: [],
      errors: []
    };

    this.init();
  }

  // Initialize production optimization
  async init() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Setup error handling
      this.setupErrorHandling();

      // Setup performance monitoring
      this.setupPerformanceMonitoring();

      // Setup caching strategy
      this.setupCaching();

      // Setup API optimization
      this.setupAPIOptimization();

      // Setup security measures
      this.setupSecurity();

      // Setup analytics
      this.setupAnalytics();

      // Setup health monitoring
      this.setupHealthMonitoring();

      // Setup resource optimization
      this.setupResourceOptimization();

      this.isInitialized = true;
      console.log('Production optimization service initialized');
    } catch (error) {
      console.error('Failed to initialize production optimization:', error);
    }
  }

  // Setup error handling
  setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', event => {
      this.handleError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', event => {
      this.handleError({
        type: 'promise',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // React error boundary integration
    window.reportReactError = (error, errorInfo) => {
      this.handleError({
        type: 'react',
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    };
  }

  // Handle errors
  handleError(errorData) {
    // Add to error queue
    this.errorQueue.push(errorData);
    this.performanceMetrics.errors.push(errorData);

    // Log error if logging is enabled
    if (this.config.enableLogging) {
      console.error('Application Error:', errorData);
    }

    // Store error locally
    this.storeErrorLocally(errorData);

    // Send to error reporting service if enabled
    if (this.config.enableErrorReporting) {
      this.sendErrorReport(errorData);
    }

    // Trigger error event
    window.dispatchEvent(
      new CustomEvent('applicationError', {
        detail: errorData
      })
    );
  }

  // Store error locally
  storeErrorLocally(errorData) {
    try {
      const errors = JSON.parse(localStorage.getItem('applicationErrors') || '[]');
      errors.push(errorData);

      // Keep only last 100 errors
      if (errors.length > 100) {
        errors.splice(0, errors.length - 100);
      }

      localStorage.setItem('applicationErrors', JSON.stringify(errors));
    } catch (error) {
      console.error('Failed to store error locally:', error);
    }
  }

  // Send error report
  async sendErrorReport(errorData) {
    try {
      await fetch(`${this.config.apiUrl}/api/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(errorData)
      });
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }

  // Setup performance monitoring
  setupPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          const pageLoadMetrics = {
            url: window.location.href,
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            firstPaint: this.getFirstPaint(),
            firstContentfulPaint: this.getFirstContentfulPaint(),
            largestContentfulPaint: this.getLargestContentfulPaint(),
            cumulativeLayoutShift: this.getCumulativeLayoutShift(),
            firstInputDelay: this.getFirstInputDelay(),
            timestamp: Date.now()
          };

          this.performanceMetrics.pageLoads.push(pageLoadMetrics);
          this.reportPerformanceMetrics('pageLoad', pageLoadMetrics);
        }
      }, 1000);
    });

    // Monitor API calls
    this.interceptFetch();

    // Monitor user interactions
    this.monitorUserInteractions();

    // Monitor memory usage
    this.monitorMemoryUsage();
  }

  // Get Core Web Vitals
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  getLargestContentfulPaint() {
    return new Promise(resolve => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry ? lastEntry.startTime : null);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } else {
        resolve(null);
      }
    });
  }

  getCumulativeLayoutShift() {
    return new Promise(resolve => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          resolve(clsValue);
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      } else {
        resolve(null);
      }
    });
  }

  getFirstInputDelay() {
    return new Promise(resolve => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver(list => {
          const firstEntry = list.getEntries()[0];
          resolve(firstEntry ? firstEntry.processingStart - firstEntry.startTime : null);
        });
        observer.observe({ entryTypes: ['first-input'] });
      } else {
        resolve(null);
      }
    });
  }

  // Intercept fetch for API monitoring
  interceptFetch() {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      const options = args[1] || {};

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();

        const apiMetrics = {
          url,
          method: options.method || 'GET',
          status: response.status,
          duration: endTime - startTime,
          timestamp: Date.now(),
          success: response.ok
        };

        this.performanceMetrics.apiCalls.push(apiMetrics);
        this.reportPerformanceMetrics('apiCall', apiMetrics);

        return response;
      } catch (error) {
        const endTime = performance.now();

        const apiMetrics = {
          url,
          method: options.method || 'GET',
          status: 0,
          duration: endTime - startTime,
          timestamp: Date.now(),
          success: false,
          error: error.message
        };

        this.performanceMetrics.apiCalls.push(apiMetrics);
        this.reportPerformanceMetrics('apiCall', apiMetrics);

        throw error;
      }
    };
  }

  // Monitor user interactions
  monitorUserInteractions() {
    const interactionEvents = ['click', 'keydown', 'scroll', 'touchstart'];

    interactionEvents.forEach(eventType => {
      document.addEventListener(
        eventType,
        event => {
          const interactionMetrics = {
            type: eventType,
            target: event.target.tagName,
            timestamp: Date.now(),
            url: window.location.href
          };

          this.performanceMetrics.userInteractions.push(interactionMetrics);

          // Keep only last 1000 interactions
          if (this.performanceMetrics.userInteractions.length > 1000) {
            this.performanceMetrics.userInteractions.splice(0, 100);
          }
        },
        { passive: true }
      );
    });
  }

  // Monitor memory usage
  monitorMemoryUsage() {
    if (performance.memory) {
      setInterval(() => {
        const memoryInfo = {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          timestamp: Date.now()
        };

        // Check for memory leaks
        if (memoryInfo.usedJSHeapSize > memoryInfo.jsHeapSizeLimit * 0.9) {
          this.handleError({
            type: 'memory',
            message: 'High memory usage detected',
            memoryInfo,
            timestamp: Date.now()
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  // Report performance metrics
  reportPerformanceMetrics(type, metrics) {
    if (this.config.enableAnalytics) {
      // Send to analytics service
      this.sendAnalytics('performance', { type, metrics });
    }

    // Store locally
    this.storeMetricsLocally(type, metrics);
  }

  // Store metrics locally
  storeMetricsLocally(type, metrics) {
    try {
      const key = `performanceMetrics_${type}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(metrics);

      // Keep only last 100 entries
      if (existing.length > 100) {
        existing.splice(0, existing.length - 100);
      }

      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.error('Failed to store metrics locally:', error);
    }
  }

  // Setup caching strategy
  setupCaching() {
    // Implement intelligent caching
    this.cacheStrategies = {
      'api-data': { ttl: 300000, maxSize: 100 }, // 5 minutes
      'user-preferences': { ttl: 86400000, maxSize: 50 }, // 24 hours
      'static-content': { ttl: 3600000, maxSize: 200 }, // 1 hour
      images: { ttl: 7200000, maxSize: 500 } // 2 hours
    };

    // Clean expired cache entries
    setInterval(() => {
      this.cleanExpiredCache();
    }, 60000); // Every minute
  }

  // Cache data
  cacheData(key, data, strategy = 'api-data') {
    const config = this.cacheStrategies[strategy];
    if (!config) {
      return;
    }

    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl,
      strategy
    };

    this.cache.set(key, cacheEntry);

    // Check cache size
    if (this.cache.size > config.maxSize) {
      this.evictOldestEntries(strategy, config.maxSize);
    }
  }

  // Get cached data
  getCachedData(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Clean expired cache
  cleanExpiredCache() {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Evict oldest entries
  evictOldestEntries(strategy, maxSize) {
    const entries = Array.from(this.cache.entries())
      .filter(([, entry]) => entry.strategy === strategy)
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    const toRemove = entries.length - maxSize;
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  // Setup API optimization
  setupAPIOptimization() {
    // Request deduplication
    this.pendingRequests = new Map();

    // Rate limiting
    this.rateLimiter = {
      requests: [],
      maxRequests: 100,
      timeWindow: 60000 // 1 minute
    };
  }

  // Optimized API call
  async optimizedApiCall(url, options = {}) {
    // Check rate limit
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded');
    }

    // Check cache first
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData && options.method !== 'POST') {
      return cachedData;
    }

    // Check for pending request
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Make request with retry logic
    const requestPromise = this.makeRequestWithRetry(url, options);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const response = await requestPromise;

      // Cache successful responses
      if (response.ok && options.method !== 'POST') {
        const data = await response.clone().json();
        this.cacheData(cacheKey, data);
      }

      return response;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  // Check rate limit
  checkRateLimit() {
    const now = Date.now();

    // Remove old requests
    this.rateLimiter.requests = this.rateLimiter.requests.filter(
      timestamp => now - timestamp < this.rateLimiter.timeWindow
    );

    // Check if under limit
    if (this.rateLimiter.requests.length >= this.rateLimiter.maxRequests) {
      return false;
    }

    // Add current request
    this.rateLimiter.requests.push(now);
    return true;
  }

  // Make request with retry
  async makeRequestWithRetry(url, options, retryCount = 0) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok && retryCount < this.config.maxRetries) {
        await this.delay(this.config.retryDelay * Math.pow(2, retryCount));
        return this.makeRequestWithRetry(url, options, retryCount + 1);
      }

      return response;
    } catch (error) {
      if (retryCount < this.config.maxRetries) {
        await this.delay(this.config.retryDelay * Math.pow(2, retryCount));
        return this.makeRequestWithRetry(url, options, retryCount + 1);
      }
      throw error;
    }
  }

  // Delay utility
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Setup security measures
  setupSecurity() {
    // Content Security Policy
    this.setupCSP();

    // Input sanitization
    this.setupInputSanitization();

    // Token security
    this.setupTokenSecurity();

    // Session management
    this.setupSessionManagement();
  }

  // Setup CSP
  setupCSP() {
    // Only inject CSP meta in production; browsers ignore some directives via meta.
    if (this.config.environment !== 'production') return;

    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' ${this.config.apiUrl};
      frame-ancestors 'none';
      object-src 'none';
    `.replace(/\s+/g, ' ').trim();

    document.head.appendChild(cspMeta);
  }

  // Setup input sanitization
  setupInputSanitization() {
    // Override form submission
    document.addEventListener('submit', event => {
      const form = event.target;
      if (form.tagName === 'FORM') {
        this.sanitizeFormData(form);
      }
    });
  }

  // Sanitize form data
  sanitizeFormData(form) {
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      if (input.type === 'text' || input.tagName === 'TEXTAREA') {
        input.value = this.sanitizeInput(input.value);
      }
    });
  }

  // Sanitize input
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  // Setup token security
  setupTokenSecurity() {
    // Encrypt tokens
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;

    localStorage.setItem = (key, value) => {
      if (key === 'token' || key === 'refreshToken') {
        value = this.encryptData(value);
      }
      return originalSetItem.call(localStorage, key, value);
    };

    localStorage.getItem = key => {
      const value = originalGetItem.call(localStorage, key);
      if ((key === 'token' || key === 'refreshToken') && value) {
        return this.decryptData(value);
      }
      return value;
    };
  }

  // Encrypt data
  encryptData(data) {
    const key = 'qasd-encryption-key-2024';
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  // Decrypt data
  decryptData(encryptedData) {
    try {
      const key = 'qasd-encryption-key-2024';
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  }

  // Setup session management
  setupSessionManagement() {
    // Auto-logout on inactivity
    let inactivityTimer;
    const inactivityTimeout = 30 * 60 * 1000; // 30 minutes

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        this.handleInactiveSession();
      }, inactivityTimeout);
    };

    // Listen for user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    // Initial timer
    resetInactivityTimer();
  }

  // Handle inactive session
  handleInactiveSession() {
    // Clear tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');

    // Redirect to login
    window.location.href = '/login';
  }

  // Setup analytics
  setupAnalytics() {
    if (!this.config.enableAnalytics) {
      return;
    }

    // Track page views
    this.trackPageView();

    // Track user interactions
    this.trackUserInteractions();

    // Track custom events
    window.trackEvent = (category, action, label, value) => {
      this.sendAnalytics('event', {
        category,
        action,
        label,
        value,
        timestamp: Date.now()
      });
    };
  }

  // Track page view
  trackPageView() {
    const pageData = {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    };

    this.sendAnalytics('pageview', pageData);
  }

  // Track user interactions
  trackUserInteractions() {
    document.addEventListener('click', event => {
      const target = event.target;
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        this.sendAnalytics('interaction', {
          type: 'click',
          element: target.tagName,
          text: target.textContent?.substring(0, 100),
          url: window.location.href,
          timestamp: Date.now()
        });
      }
    });
  }

  // Send analytics
  async sendAnalytics(type, data) {
    try {
      await fetch(`${this.config.apiUrl}/api/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type, data })
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }

  // Setup health monitoring
  setupHealthMonitoring() {
    // Monitor application health
    setInterval(() => {
      this.checkApplicationHealth();
    }, 60000); // Every minute
  }

  // Check application health
  async checkApplicationHealth() {
    const healthData = {
      timestamp: Date.now(),
      url: window.location.href,
      memory: performance.memory
        ? {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        }
        : null,
      performance: {
        apiCalls: this.performanceMetrics.apiCalls.length,
        errors: this.performanceMetrics.errors.length,
        cacheSize: this.cache.size
      },
      network: navigator.onLine,
      storage: this.getStorageUsage()
    };

    // Check for issues
    const issues = this.detectHealthIssues(healthData);

    if (issues.length > 0) {
      this.handleHealthIssues(issues, healthData);
    }

    // Store health data
    this.storeHealthData(healthData);
  }

  // Get storage usage
  getStorageUsage() {
    try {
      let totalSize = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }
      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  // Detect health issues
  detectHealthIssues(healthData) {
    const issues = [];

    // Memory issues
    if (healthData.memory && healthData.memory.used > healthData.memory.limit * 0.9) {
      issues.push({
        type: 'memory',
        severity: 'high',
        message: 'High memory usage detected'
      });
    }

    // Error rate issues
    const recentErrors = this.performanceMetrics.errors.filter(
      error => Date.now() - error.timestamp < 300000 // Last 5 minutes
    );

    if (recentErrors.length > 10) {
      issues.push({
        type: 'errors',
        severity: 'medium',
        message: 'High error rate detected'
      });
    }

    // Storage issues
    if (healthData.storage > 5 * 1024 * 1024) {
      // 5MB
      issues.push({
        type: 'storage',
        severity: 'low',
        message: 'High storage usage detected'
      });
    }

    return issues;
  }

  // Handle health issues
  handleHealthIssues(issues, healthData) {
    issues.forEach(issue => {
      // Log issue
      console.warn('Health issue detected:', issue);

      // Take corrective action
      switch (issue.type) {
        case 'memory':
          this.cleanupMemory();
          break;
        case 'errors':
          this.resetErrorState();
          break;
        case 'storage':
          this.cleanupStorage();
          break;
      }
    });

    // Report issues
    this.reportHealthIssues(issues, healthData);
  }

  // Cleanup memory
  cleanupMemory() {
    // Clear old cache entries
    this.cleanExpiredCache();

    // Clear old performance metrics
    this.performanceMetrics.apiCalls = this.performanceMetrics.apiCalls.slice(-100);
    this.performanceMetrics.userInteractions = this.performanceMetrics.userInteractions.slice(-100);

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }

  // Reset error state
  resetErrorState() {
    this.errorQueue = [];
    this.performanceMetrics.errors = this.performanceMetrics.errors.slice(-50);
  }

  // Cleanup storage
  cleanupStorage() {
    // Remove old data
    const keysToClean = ['performanceMetrics_pageLoad', 'performanceMetrics_apiCall', 'applicationErrors'];

    keysToClean.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        if (data.length > 50) {
          localStorage.setItem(key, JSON.stringify(data.slice(-50)));
        }
      } catch (error) {
        console.error('Failed to cleanup storage:', error);
      }
    });
  }

  // Store health data
  storeHealthData(healthData) {
    try {
      const healthHistory = JSON.parse(localStorage.getItem('healthHistory') || '[]');
      healthHistory.push(healthData);

      // Keep only last 24 entries (24 hours)
      if (healthHistory.length > 24) {
        healthHistory.splice(0, healthHistory.length - 24);
      }

      localStorage.setItem('healthHistory', JSON.stringify(healthHistory));
    } catch (error) {
      console.error('Failed to store health data:', error);
    }
  }

  // Report health issues
  async reportHealthIssues(issues, healthData) {
    try {
      await fetch(`${this.config.apiUrl}/api/health/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ issues, healthData })
      });
    } catch (error) {
      console.error('Failed to report health issues:', error);
    }
  }

  // Setup resource optimization
  setupResourceOptimization() {
    // Lazy load images
    this.setupLazyLoading();

    // Preload critical resources
    this.preloadCriticalResources();

    // Optimize fonts
    this.optimizeFonts();
  }

  // Setup lazy loading
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      // Observe all lazy images
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // Preload critical resources
  preloadCriticalResources() {
    const criticalResources = ['/api/auth/me', '/api/reports/dashboard'];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;

      if (resource.includes('/api/')) {
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
      } else if (resource.includes('/fonts/')) {
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
      }

      document.head.appendChild(link);
    });
  }

  // Optimize fonts
  optimizeFonts() {
    // Add font-display: swap to all font faces
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  // Get performance report
  getPerformanceReport() {
    return {
      metrics: this.performanceMetrics,
      cache: {
        size: this.cache.size,
        strategies: this.cacheStrategies
      },
      errors: this.errorQueue,
      config: this.config,
      timestamp: Date.now()
    };
  }

  // Get health status
  getHealthStatus() {
    try {
      const healthHistory = JSON.parse(localStorage.getItem('healthHistory') || '[]');
      const latest = healthHistory[healthHistory.length - 1];

      return {
        status: 'healthy',
        lastCheck: latest?.timestamp || Date.now(),
        issues: this.detectHealthIssues(latest || {}),
        history: healthHistory
      };
    } catch (error) {
      return {
        status: 'unknown',
        error: error.message
      };
    }
  }
}

// Create singleton instance
const productionOptimizationService = new ProductionOptimizationService();

export default productionOptimizationService;
export { ProductionOptimizationService };
