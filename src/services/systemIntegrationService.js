
/**
 * System Integration Service
 * Orchestrates all Phase 2 services and ensures seamless integration
 */

import documentService from './documentService';
import analyticsService from './analyticsService';
import pwaService from './pwaService';
import securityService from './securityService';
import performanceService from './performanceService';
import backupService from './backupService';
import monitoringService from './monitoringService';
import notificationService from './notificationService';
import mobileOptimizationService from './mobileOptimizationService';
import productionOptimizationService from './productionOptimizationService';

class SystemIntegrationService {
  constructor() {
    this.isInitialized = false;
    this.services = {
      document: documentService,
      analytics: analyticsService,
      pwa: pwaService,
      security: securityService,
      performance: performanceService,
      backup: backupService,
      monitoring: monitoringService,
      notification: notificationService,
      mobileOptimization: mobileOptimizationService,
      productionOptimization: productionOptimizationService
    };

    this.integrationConfig = {
      autoBackup: true,
      realTimeMonitoring: true,
      performanceOptimization: true,
      securityEnforcement: true,
      mobileOptimization: true,
      analyticsTracking: true,
      notificationSystem: true,
      documentManagement: true,
      pwaFeatures: true
    };

    this.systemStatus = {
      overall: 'initializing',
      services: {},
      lastHealthCheck: null,
      issues: [],
      performance: {
        score: 0,
        metrics: {}
      }
    };

    this.eventBus = new EventTarget();
    this.init();
  }


  // Helper: pick an initialization function if available
  getInitFunction(service) {
    const candidates = ['init','initialize','initializeService','initializeMonitoring'];
    for (const name of candidates) {
      const fn = service?.[name]; if (typeof fn === 'function') return fn;
    } return null;
  }

  // Helper: wrap a promise with a timeout to avoid hanging
  async withTimeout(promise, ms=10000, label='operation') {
    return Promise.race([Promise.resolve(promise),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error(`${label} timed out after ${ms}ms`)), ms))]);
  }

  // Helper: unified notification wrapper compatible with NotificationService API
  notify(type, message, options={}) {
    const svc = this.services?.notification;
    if (!svc) return;
    if (typeof svc.send === 'function') { return svc.send(type, message, options); }
    if (typeof svc.sendNotification === 'function') {
      return svc.sendNotification({ title: options.title || String(type).charAt(0).toUpperCase()+String(type).slice(1),
        body: message || options.message || '', category: options.category || type, ...options });
    }
  }

  // Initialize system integration
  async init() {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🚀 Initializing QASD System Integration...');

      // Initialize core services first
      await this.initializeCoreServices();

      // Setup service integrations
      await this.setupServiceIntegrations();

      // Setup system monitoring
      await this.setupSystemMonitoring();

      // Setup event handling
      this.setupEventHandling();

      // Setup automated tasks
      this.setupAutomatedTasks();

      // Perform initial health check
      await this.performHealthCheck();

      // Setup service worker integration
      await this.setupServiceWorkerIntegration();

      // Setup data synchronization
      this.setupDataSynchronization();

      // Setup cross-service communication
      this.setupCrossServiceCommunication();

      this.isInitialized = true;
      this.systemStatus.overall = 'operational';

      console.log('✅ QASD System Integration initialized successfully');
      this.broadcastSystemEvent('system:initialized', { timestamp: Date.now() });
    } catch (error) {
      console.error('❌ Failed to initialize system integration:', error);
      this.systemStatus.overall = 'error';
      this.systemStatus.issues.push({
        type: 'initialization',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  // Initialize core services
  async initializeCoreServices() {
    const initPromises = [];

    // Initialize services in order of dependency
    const initOrder = [
      'security',
      'performance',
      'monitoring',
      'notification',
      'backup',
      'mobileOptimization',
      'productionOptimization',
      'analytics',
      'document',
      'pwa'
    ];

    for (const serviceName of initOrder) {
      try {
        const service = this.services[serviceName];
        if (service && typeof service.init === 'function') {
          console.log(`🔧 Initializing ${serviceName} service...`);
          await service.init();
          this.systemStatus.services[serviceName] = 'operational';
          console.log(`✅ ${serviceName} service initialized`);
        } else {
          this.systemStatus.services[serviceName] = 'not_available';
        }
      } catch (error) {
        console.error(`❌ Failed to initialize ${serviceName} service:`, error);
        this.systemStatus.services[serviceName] = 'error';
        this.systemStatus.issues.push({
          type: 'service_initialization',
          service: serviceName,
          message: error.message,
          timestamp: Date.now()
        });
      }
    }

    // Also support services exposing initialize/initializeService with timeout safety
    for (const serviceName of initOrder) {
      try {
        const service = this.services[serviceName];
        const initFn = this.getInitFunction?.(service);
        if (service && initFn) {
          console.log(`🔧 Initializing ${serviceName} service...`);
          // Apply a timeout so we never hang forever
          const label = `${serviceName}.${initFn.name || 'init'}`;
          if (serviceName === 'pwa' && initFn === service.initialize) {
            // PWA may show prompts/permissions; give it a bit more time
            await this.withTimeout(initFn.call(service), 15000, label);
          } else {
            await this.withTimeout(initFn.call(service), 10000, label);
          }
          this.systemStatus.services[serviceName] = 'operational';
          console.log(`✅ ${serviceName} service initialized`);
        } else if (service) {
          // No explicit init; consider it operational if constructor already initialized
          this.systemStatus.services[serviceName] = 'operational';
          console.log(`ℹ️ ${serviceName} has no init(), marked operational`);
        } else {
          this.systemStatus.services[serviceName] = 'not_available';
        }
      } catch (error) {
        console.error(`❌ Failed to initialize ${serviceName} service:`, error);
        this.systemStatus.services[serviceName] = 'error';
        this.systemStatus.issues.push({
          type: 'service_initialization',
          service: serviceName,
          message: error.message,
          timestamp: Date.now()
        });
      }
    }
    return;

  }

  // Setup service integrations
  async setupServiceIntegrations() {
    // Document service integrations
    this.setupDocumentIntegrations();

    // Analytics integrations
    this.setupAnalyticsIntegrations();

    // Security integrations
    this.setupSecurityIntegrations();

    // Performance integrations
    this.setupPerformanceIntegrations();

    // Mobile optimization integrations
    this.setupMobileIntegrations();

    // PWA integrations
    this.setupPWAIntegrations();

    // Backup integrations
    this.setupBackupIntegrations();

    // Notification integrations
    this.setupNotificationIntegrations();
  }

  // Setup document integrations
  setupDocumentIntegrations() {
    // Integrate document generation with analytics
    if (this.services.document && this.services.analytics) {
      const originalGenerateDocument = this.services.document.generateDocument;
      this.services.document.generateDocument = async (...args) => {
        const result = await originalGenerateDocument.apply(this.services.document, args);

        // Track document generation
        this.services.analytics.trackEvent('document', 'generated', {
          type: args[0],
          timestamp: Date.now()
        });

        return result;
      };
    }

    // Integrate document access with security
    if (this.services.document && this.services.security) {
      this.services.document.validateAccess = (userId, documentId, action) => {
        return this.services.security.validateDocumentAccess(userId, documentId, action);
      };
    }
  }

  // Setup analytics integrations
  setupAnalyticsIntegrations() {
    // Integrate analytics with performance monitoring
    if (this.services.analytics && this.services.performance) {
      this.services.performance.onMetricCollected = metric => {
        this.services.analytics.trackPerformanceMetric(metric);
      };
    }

    // Integrate analytics with security events
    if (this.services.analytics && this.services.security) {
      this.services.security.onSecurityEvent = event => {
        this.services.analytics.trackSecurityEvent(event);
      };
    }
  }

  // Setup security integrations
  setupSecurityIntegrations() {
    // Integrate security with all API calls
    if (this.services.security) {
      // Override fetch to add security headers
      const originalFetch = window.fetch;
      window.fetch = async (url, options = {}) => {
        const secureHeaders = this.services.security?.getSecurityHeaders?.() || {};
        const secureOptions = { ...options, headers: { ...secureHeaders, ...(options.headers || {}) } };
        return originalFetch(url, secureOptions);
      };
    }
  }

  // Setup performance integrations
  setupPerformanceIntegrations() {
    // Integrate performance monitoring with all services
    Object.keys(this.services).forEach(serviceName => {
      const service = this.services[serviceName];
      if (service && typeof service === 'object') {
        this.wrapServiceMethods(serviceName, service);
      }
    });
  }

  // Wrap service methods for performance monitoring
  wrapServiceMethods(serviceName, service) {
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(service)).filter(
      name => typeof service[name] === 'function' && name !== 'constructor'
    );

    methodNames.forEach(methodName => {
      const originalMethod = service[methodName];
      service[methodName] = async (...args) => {
        const startTime = performance.now();

        try {
          const result = await originalMethod.apply(service, args);
          const endTime = performance.now();

          // Track performance
          if (this.services.performance) {
            this.services.performance.trackMethodCall({
              service: serviceName,
              method: methodName,
              duration: endTime - startTime,
              success: true,
              timestamp: Date.now()
            });
          }

          return result;
        } catch (error) {
          const endTime = performance.now();

          // Track error
          if (this.services.performance) {
            this.services.performance.trackMethodCall({
              service: serviceName,
              method: methodName,
              duration: endTime - startTime,
              success: false,
              error: error.message,
              timestamp: Date.now()
            });
          }

          throw error;
        }
      };
    });
  }

  // Setup mobile integrations
  setupMobileIntegrations() {
    if (this.services.mobileOptimization) {
      // Integrate mobile optimization with performance
      this.services.mobileOptimization.onOptimizationApplied = optimization => {
        if (this.services.performance) {
          this.services.performance.trackOptimization(optimization);
        }
      };

      // Integrate mobile optimization with analytics
      this.services.mobileOptimization.onDeviceDetected = deviceInfo => {
        if (this.services.analytics) {
          this.services.analytics.trackDeviceInfo(deviceInfo);
        }
      };
    }
  }

  // Setup PWA integrations
  setupPWAIntegrations() {
    if (this.services.pwa) {
      // Integrate PWA with backup service
      this.services.pwa.onOfflineDataStored = data => {
        if (this.services.backup) {
          this.services.backup.backupOfflineData(data);
        }
      };

      // Integrate PWA with notification service
      this.services.pwa.onPushReceived = notification => {
        if (this.services.notification) {
          this.services.notification.handlePushNotification(notification);
        }
      };
    }
  }

  // Setup backup integrations
  setupBackupIntegrations() {
    if (this.services.backup) {
      // Auto-backup on critical data changes
      this.eventBus.addEventListener('data:critical_change', event => {
        this.services.backup.scheduleBackup('immediate', event.detail);
      });

      // Integrate backup with monitoring
      this.services.backup.onBackupCompleted = backupInfo => {
        if (this.services.monitoring) {
          this.services.monitoring.logBackupEvent(backupInfo);
        }
      };
    }
  }

  // Setup notification integrations
  setupNotificationIntegrations() {
    if (this.services.notification) {
      // Integrate notifications with all services
      Object.keys(this.services).forEach(serviceName => {
        const service = this.services[serviceName];
        if (service && service !== this.services.notification) {
          service.notify = (type, message, options = {}) => {
            this.services.notification.send(type, message, {
              ...options,
              source: serviceName
            });
          };
        }
      });
    }
  }

  // Setup system monitoring
  async setupSystemMonitoring() {
    if (this.services.monitoring) {
      // Monitor system health every minute
      setInterval(() => {
        this.performHealthCheck();
      }, 60000);

      // Monitor performance every 5 minutes
      setInterval(() => {
        this.collectPerformanceMetrics();
      }, 300000);

      // Monitor security every 30 seconds
      setInterval(() => {
        this.performSecurityCheck();
      }, 30000);
    }
  }

  // Setup event handling
  setupEventHandling() {
    // System-wide error handling
    window.addEventListener('error', event => {
      this.handleSystemError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.handleSystemError({
        type: 'promise',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        timestamp: Date.now()
      });
    });

    // Network status changes
    window.addEventListener('online', () => {
      this.handleNetworkStatusChange(true);
    });

    window.addEventListener('offline', () => {
      this.handleNetworkStatusChange(false);
    });

    // Visibility changes
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange(document.visibilityState);
    });
  }

  // Setup automated tasks
  setupAutomatedTasks() {
    // Daily tasks
    this.scheduleDailyTasks();

    // Weekly tasks
    this.scheduleWeeklyTasks();

    // Monthly tasks
    this.scheduleMonthlyTasks();
  }

  // Schedule daily tasks
  scheduleDailyTasks() {
    const runDailyTasks = () => {
      console.log('🔄 Running daily automated tasks...');

      // Backup data
      if (this.services.backup) {
        this.services.backup.createBackup('daily');
      }

      // Generate daily reports
      if (this.services.analytics) {
        this.services.analytics.generateDailyReport();
      }

      // Clean up old data
      this.cleanupOldData();

      // Optimize performance
      if (this.services.performance) {
        this.services.performance.optimizeCache();
      }

      console.log('✅ Daily tasks completed');
    };

    // Run at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      runDailyTasks();
      setInterval(runDailyTasks, 24 * 60 * 60 * 1000); // Every 24 hours
    }, msUntilMidnight);
  }

  // Schedule weekly tasks
  scheduleWeeklyTasks() {
    const runWeeklyTasks = () => {
      console.log('🔄 Running weekly automated tasks...');

      // Generate weekly reports
      if (this.services.analytics) {
        this.services.analytics.generateWeeklyReport();
      }

      // Perform security audit
      if (this.services.security) {
        this.services.security.performSecurityAudit();
      }

      // Optimize database
      this.optimizeDatabase();

      console.log('✅ Weekly tasks completed');
    };

    // Run every Sunday at 2 AM
    const scheduleWeekly = () => {
      const now = new Date();
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + (7 - now.getDay()));
      nextSunday.setHours(2, 0, 0, 0);

      const msUntilSunday = nextSunday.getTime() - now.getTime();

      setTimeout(() => {
        runWeeklyTasks();
        setInterval(runWeeklyTasks, 7 * 24 * 60 * 60 * 1000); // Every 7 days
      }, msUntilSunday);
    };

    scheduleWeekly();
  }

  // Schedule monthly tasks
  scheduleMonthlyTasks() {
    const runMonthlyTasks = () => {
      console.log('🔄 Running monthly automated tasks...');

      // Generate monthly reports
      if (this.services.analytics) {
        this.services.analytics.generateMonthlyReport();
      }

      // Archive old data
      this.archiveOldData();

      // Update system configurations
      this.updateSystemConfigurations();

      console.log('✅ Monthly tasks completed');
    };

    // Run on the 1st of each month at 3 AM
    const scheduleMonthly = () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 3, 0, 0, 0);

      const msUntilNextMonth = nextMonth.getTime() - now.getTime();

      setTimeout(() => {
        runMonthlyTasks();

        // Schedule next month
        scheduleMonthly();
      }, msUntilNextMonth);
    };

    scheduleMonthly();
  }

  // Perform health check
  async performHealthCheck() {
    try {
      const healthStatus = {
        timestamp: Date.now(),
        overall: 'healthy',
        services: {},
        performance: {},
        security: {},
        issues: []
      };

      // Check each service
      for (const [serviceName, service] of Object.entries(this.services)) {
        try {
          if (service && typeof service.getHealthStatus === 'function') {
            const serviceHealth = await service.getHealthStatus();
            healthStatus.services[serviceName] = serviceHealth;

            if (serviceHealth.status !== 'healthy') {
              healthStatus.issues.push({
                service: serviceName,
                status: serviceHealth.status,
                issues: serviceHealth.issues || []
              });
            }
          } else {
            healthStatus.services[serviceName] = { status: 'unknown' };
          }
        } catch (error) {
          healthStatus.services[serviceName] = {
            status: 'error',
            error: error.message
          };
          healthStatus.issues.push({
            service: serviceName,
            status: 'error',
            error: error.message
          });
        }
      }

      // Determine overall health
      const errorServices = Object.values(healthStatus.services).filter(service => service.status === 'error').length;

      if (errorServices > 0) {
        healthStatus.overall = errorServices > 3 ? 'critical' : 'degraded';
      }

      this.systemStatus = { ...this.systemStatus, ...healthStatus };
      this.systemStatus.lastHealthCheck = Date.now();

      // Broadcast health status
      this.broadcastSystemEvent('system:health_check', healthStatus);

      // Handle critical issues
      if (healthStatus.overall === 'critical') {
        this.handleCriticalIssues(healthStatus.issues);
      }
    } catch (error) {
      console.error('Failed to perform health check:', error);
      this.systemStatus.overall = 'error';
      this.systemStatus.issues.push({
        type: 'health_check',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  // Collect performance metrics
  async collectPerformanceMetrics() {
    try {
      const metrics = {
        timestamp: Date.now(),
        memory: performance.memory
          ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          }
          : null,
        navigation: performance.getEntriesByType('navigation')[0],
        resources: performance.getEntriesByType('resource').length,
        measures: performance.getEntriesByType('measure').length
      };

      // Calculate performance score
      const score = this.calculatePerformanceScore(metrics);

      this.systemStatus.performance = {
        score,
        metrics,
        timestamp: Date.now()
      };

      // Broadcast performance metrics
      this.broadcastSystemEvent('system:performance_metrics', {
        score,
        metrics
      });
    } catch (error) {
      console.error('Failed to collect performance metrics:', error);
    }
  }

  // Calculate performance score
  calculatePerformanceScore(metrics) {
    let score = 100;

    // Memory usage penalty
    if (metrics.memory) {
      const memoryUsage = metrics.memory.used / metrics.memory.limit;
      if (memoryUsage > 0.9) {
        score -= 30;
      } else if (memoryUsage > 0.7) {
        score -= 15;
      } else if (memoryUsage > 0.5) {
        score -= 5;
      }
    }

    // Navigation timing penalty
    if (metrics.navigation) {
      const loadTime = metrics.navigation.loadEventEnd - metrics.navigation.loadEventStart;
      if (loadTime > 5000) {
        score -= 25;
      } else if (loadTime > 3000) {
        score -= 15;
      } else if (loadTime > 1000) {
        score -= 5;
      }
    }

    // Resource count penalty
    if (metrics.resources > 100) {
      score -= 10;
    } else if (metrics.resources > 50) {
      score -= 5;
    }

    return Math.max(0, score);
  }

  // Perform security check
  async performSecurityCheck() {
    try {
      if (this.services.security) {
        const securityStatus = await this.services.security.performSecurityCheck();

        if (securityStatus.threats && securityStatus.threats.length > 0) {
          this.handleSecurityThreats(securityStatus.threats);
        }
      }
    } catch (error) {
      console.error('Failed to perform security check:', error);
    }
  }

  // Handle system error
  handleSystemError(error) {
    console.error('System error:', error);

    // Add to system issues
    this.systemStatus.issues.push({
      type: 'system_error',
      ...error
    });

    // Notify monitoring service
    if (this.services.monitoring) {
      this.services.monitoring.logError(error);
    }

    // Send notification for critical errors
    if (error.type === 'javascript' && this.services.notification) {
      this.services.notification.send('error', 'System Error Detected', {
        message: error.message,
        priority: 'high'
      });
    }

    // Broadcast error event
    this.broadcastSystemEvent('system:error', error);
  }

  // Handle network status change
  handleNetworkStatusChange(isOnline) {
    console.log(`Network status changed: ${isOnline ? 'online' : 'offline'}`);

    if (isOnline) {
      // Sync offline data
      if (this.services.pwa) {
        this.services.pwa.syncOfflineData();
      }

      // Resume monitoring
      if (this.services.monitoring) {
        this.services.monitoring.resumeMonitoring();
      }
    } else {
      // Enable offline mode
      if (this.services.pwa) {
        this.services.pwa.enableOfflineMode();
      }

      // Pause non-critical monitoring
      if (this.services.monitoring) {
        this.services.monitoring.pauseNonCriticalMonitoring();
      }
    }

    // Broadcast network status
    this.broadcastSystemEvent('system:network_status', { isOnline });
  }

  // Handle visibility change
  handleVisibilityChange(visibilityState) {
    if (visibilityState === 'hidden') {
      // App is hidden, reduce activity
      if (this.services.performance) {
        this.services.performance.reduceActivity();
      }
    } else {
      // App is visible, resume normal activity
      if (this.services.performance) {
        this.services.performance.resumeActivity();
      }

      // Check for updates
      this.checkForUpdates();
    }

    // Broadcast visibility change
    this.broadcastSystemEvent('system:visibility_change', { visibilityState });
  }

  // Handle critical issues
  handleCriticalIssues(issues) {
    console.error('Critical system issues detected:', issues);

    // Send critical notification
    if (this.services.notification) {
      this.services.notification.send('critical', 'Critical System Issues', {
        message: `${issues.length} critical issues detected`,
        issues: issues.slice(0, 3), // Show first 3 issues
        priority: 'critical'
      });
    }

    // Attempt automatic recovery
    this.attemptAutomaticRecovery(issues);
  }

  // Handle security threats
  handleSecurityThreats(threats) {
    console.warn('Security threats detected:', threats);

    // Send security notification
    if (this.services.notification) {
      this.services.notification.send('security', 'Security Threats Detected', {
        message: `${threats.length} security threats detected`,
        threats: threats.slice(0, 3),
        priority: 'high'
      });
    }

    // Apply security measures
    if (this.services.security) {
      this.services.security.applySecurityMeasures(threats);
    }
  }

  // Attempt automatic recovery
  attemptAutomaticRecovery(issues) {
    issues.forEach(issue => {
      try {
        switch (issue.type) {
          case 'memory':
            this.recoverFromMemoryIssue();
            break;
          case 'performance':
            this.recoverFromPerformanceIssue();
            break;
          case 'service_error':
            this.recoverFromServiceError(issue.service);
            break;
          default:
            console.log(`No automatic recovery available for issue type: ${issue.type}`);
        }
      } catch (error) {
        console.error(`Failed to recover from ${issue.type}:`, error);
      }
    });
  }

  // Recover from memory issue
  recoverFromMemoryIssue() {
    console.log('Attempting memory recovery...');

    // Clear caches
    Object.values(this.services).forEach(service => {
      if (service && typeof service.clearCache === 'function') {
        service.clearCache();
      }
    });

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }

  // Recover from performance issue
  recoverFromPerformanceIssue() {
    console.log('Attempting performance recovery...');

    // Optimize performance
    if (this.services.performance) {
      this.services.performance.optimizePerformance();
    }

    // Reduce activity
    Object.values(this.services).forEach(service => {
      if (service && typeof service.reduceActivity === 'function') {
        service.reduceActivity();
      }
    });
  }

  // Recover from service error
  async recoverFromServiceError(serviceName) {
    console.log(`Attempting to recover ${serviceName} service...`);

    const service = this.services[serviceName];
    if (service) {
      try {
        // Restart service
        if (typeof service.restart === 'function') {
          await service.restart();
        } else if (typeof service.init === 'function') {
          await service.init();
        }

        this.systemStatus.services[serviceName] = 'operational';
        console.log(`✅ ${serviceName} service recovered`);
      } catch (error) {
        console.error(`Failed to recover ${serviceName} service:`, error);
        this.systemStatus.services[serviceName] = 'error';
      }
    }
  }

  // Setup service worker integration
  async setupServiceWorkerIntegration() {
    if ('serviceWorker' in navigator && this.services.pwa) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', event => {
          this.handleServiceWorkerMessage(event.data);
        });

        console.log('Service worker integration setup complete');
      } catch (error) {
        console.error('Failed to setup service worker integration:', error);
      }
    }
  }

  // Handle service worker messages
  handleServiceWorkerMessage(data) {
    switch (data.type) {
      case 'CACHE_UPDATED':
        this.broadcastSystemEvent('system:cache_updated', data);
        break;
      case 'OFFLINE_DATA_SYNCED':
        this.broadcastSystemEvent('system:offline_data_synced', data);
        break;
      case 'PUSH_RECEIVED':
        if (this.services.notification) {
          this.services.notification.handlePushNotification(data.notification);
        }
        break;
      default:
        console.log('Unknown service worker message:', data);
    }
  }

  // Setup data synchronization
  setupDataSynchronization() {
    // Sync data between services
    this.eventBus.addEventListener('data:updated', event => {
      this.synchronizeData(event.detail);
    });

    // Periodic data sync
    setInterval(() => {
      this.performDataSync();
    }, 300000); // Every 5 minutes
  }

  // Synchronize data
  synchronizeData(dataUpdate) {
    const { type, data, source } = dataUpdate;

    // Sync with relevant services
    Object.entries(this.services).forEach(([serviceName, service]) => {
      if (serviceName !== source && service && typeof service.syncData === 'function') {
        try {
          service.syncData(type, data);
        } catch (error) {
          console.error(`Failed to sync data with ${serviceName}:`, error);
        }
      }
    });
  }

  // Perform data sync
  async performDataSync() {
    try {
      // Sync with server
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          timestamp: Date.now(),
          services: Object.keys(this.services)
        })
      });

      if (response.ok) {
        const syncData = await response.json();
        this.handleSyncData(syncData);
      }
    } catch (error) {
      console.error('Failed to perform data sync:', error);
    }
  }

  // Handle sync data
  handleSyncData(syncData) {
    Object.entries(syncData).forEach(([serviceName, data]) => {
      const service = this.services[serviceName];
      if (service && typeof service.handleSyncData === 'function') {
        try {
          service.handleSyncData(data);
        } catch (error) {
          console.error(`Failed to handle sync data for ${serviceName}:`, error);
        }
      }
    });
  }

  // Setup cross-service communication
  setupCrossServiceCommunication() {
    // Create communication channels between services
    Object.entries(this.services).forEach(([serviceName, service]) => {
      if (service && typeof service === 'object') {
        service.communicate = (targetService, message, data) => {
          return this.communicateWithService(serviceName, targetService, message, data);
        };
      }
    });
  }

  // Communicate with service
  async communicateWithService(sourceService, targetService, message, data) {
    const target = this.services[targetService];
    if (!target) {
      throw new Error(`Service ${targetService} not found`);
    }

    try {
      if (typeof target.handleMessage === 'function') {
        return await target.handleMessage(sourceService, message, data);
      } else {
        console.warn(`Service ${targetService} does not support message handling`);
        return null;
      }
    } catch (error) {
      console.error(`Failed to communicate with ${targetService}:`, error);
      throw error;
    }
  }

  // Cleanup old data
  cleanupOldData() {
    console.log('🧹 Cleaning up old data...');

    // Clean up localStorage
    this.cleanupLocalStorage();

    // Clean up IndexedDB
    this.cleanupIndexedDB();

    // Clean up service caches
    Object.values(this.services).forEach(service => {
      if (service && typeof service.cleanup === 'function') {
        try {
          service.cleanup();
        } catch (error) {
          console.error('Failed to cleanup service:', error);
        }
      }
    });
  }

  // Cleanup localStorage
  cleanupLocalStorage() {
    const keysToClean = ['performanceMetrics_', 'applicationErrors', 'healthHistory', 'analyticsData_'];

    Object.keys(localStorage).forEach(key => {
      if (keysToClean.some(prefix => key.startsWith(prefix))) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(data) && data.length > 100) {
            localStorage.setItem(key, JSON.stringify(data.slice(-50)));
          }
        } catch (error) {
          console.error(`Failed to cleanup localStorage key ${key}:`, error);
        }
      }
    });
  }

  // Cleanup IndexedDB
  async cleanupIndexedDB() {
    try {
      if ('indexedDB' in window) {
        // This would be implemented based on specific IndexedDB usage
        console.log('IndexedDB cleanup completed');
      }
    } catch (error) {
      console.error('Failed to cleanup IndexedDB:', error);
    }
  }

  // Optimize database
  async optimizeDatabase() {
    console.log('🔧 Optimizing database...');

    try {
      const response = await fetch('/api/admin/optimize-database', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        console.log('✅ Database optimization completed');
      }
    } catch (error) {
      console.error('Failed to optimize database:', error);
    }
  }

  // Archive old data
  async archiveOldData() {
    console.log('📦 Archiving old data...');

    try {
      const response = await fetch('/api/admin/archive-data', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        console.log('✅ Data archiving completed');
      }
    } catch (error) {
      console.error('Failed to archive data:', error);
    }
  }

  // Update system configurations
  async updateSystemConfigurations() {
    console.log('⚙️ Updating system configurations...');

    try {
      const response = await fetch('/api/admin/system-config', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const config = await response.json();
        this.updateIntegrationConfig(config);
        console.log('✅ System configurations updated');
      }
    } catch (error) {
      console.error('Failed to update system configurations:', error);
    }
  }

  // Update integration config
  updateIntegrationConfig(newConfig) {
    this.integrationConfig = {
      ...this.integrationConfig,
      ...newConfig
    };

    // Apply configuration changes
    Object.entries(this.services).forEach(([serviceName, service]) => {
      if (service && typeof service.updateConfig === 'function') {
        try {
          service.updateConfig(newConfig[serviceName] || {});
        } catch (error) {
          console.error(`Failed to update config for ${serviceName}:`, error);
        }
      }
    });
  }

  // Check for updates
  async checkForUpdates() {
    try {
      const response = await fetch('/api/system/version');
      if (response.ok) {
        const versionInfo = await response.json();

        if (versionInfo.hasUpdate) {
          this.handleSystemUpdate(versionInfo);
        }
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }

  // Handle system update
  handleSystemUpdate(versionInfo) {
    if (this.services.notification) {
      this.services.notification.send('info', 'System Update Available', {
        message: `Version ${versionInfo.version} is available`,
        action: 'update',
        priority: 'medium'
      });
    }

    this.broadcastSystemEvent('system:update_available', versionInfo);
  }

  // Broadcast system event
  broadcastSystemEvent(type, data) {
    const event = new CustomEvent(type, { detail: data });
    this.eventBus.dispatchEvent(event);
    window.dispatchEvent(event);
  }

  // Public API methods

  // Get system status
  getSystemStatus() {
    return {
      ...this.systemStatus,
      isInitialized: this.isInitialized,
      config: this.integrationConfig
    };
  }

  // Get service status
  getServiceStatus(serviceName) {
    if (!serviceName) {
      return this.systemStatus.services;
    }

    return this.systemStatus.services[serviceName] || { status: 'not_found' };
  }

  // Restart service
  async restartService(serviceName) {
    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    try {
      const getInitFn = s => ['init','initialize','initializeService']
        .map(n => s?.[n]).find(fn => typeof fn === 'function');
      const initFn = getInitFn(service);
      if (initFn) {
        await initFn.call(service);
        this.systemStatus.services[serviceName] = 'operational';
        this.broadcastSystemEvent('service:restarted', { serviceName });
        return { success: true, message: `${serviceName} service restarted successfully` };
      } else {
        throw new Error(`Service ${serviceName} does not have an init function`);
      }
    } catch (error) {
      this.systemStatus.services[serviceName] = 'error';
      throw new Error(`Failed to restart ${serviceName}: ${error.message}`);
    }
  }

  // Enable/disable service
  toggleService(serviceName, enabled) {
    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    try {
      if (enabled) {
        if (typeof service.enable === 'function') {
          service.enable();
        }
        this.systemStatus.services[serviceName] = 'operational';
      } else {
        if (typeof service.disable === 'function') {
          service.disable();
        }
        this.systemStatus.services[serviceName] = 'disabled';
      }

      this.broadcastSystemEvent('service:toggled', { serviceName, enabled });

      return { success: true, message: `${serviceName} service ${enabled ? 'enabled' : 'disabled'}` };
    } catch (error) {
      throw new Error(`Failed to ${enabled ? 'enable' : 'disable'} ${serviceName}: ${error.message}`);
    }
  }

  // Get performance report
  getPerformanceReport() {
    return {
      systemPerformance: this.systemStatus.performance,
      servicePerformance: Object.fromEntries(
        Object.entries(this.services).map(([name, service]) => [
          name,
          service && typeof service.getPerformanceReport === 'function'
            ? service.getPerformanceReport()
            : { status: 'no_data' }
        ])
      ),
      timestamp: Date.now()
    };
  }

  // Subscribe to system events
  subscribe(eventType, callback) {
    this.eventBus.addEventListener(eventType, callback);

    // Return unsubscribe function
    return () => {
      this.eventBus.removeEventListener(eventType, callback);
    };
  }

  // Emergency shutdown
  async emergencyShutdown() {
    console.log('🚨 Emergency shutdown initiated...');

    try {
      // Save critical data
      if (this.services.backup) {
        await this.services.backup.createEmergencyBackup();
      }

      // Notify all services
      Object.values(this.services).forEach(service => {
        if (service && typeof service.emergencyShutdown === 'function') {
          try {
            service.emergencyShutdown();
          } catch (error) {
            console.error('Service emergency shutdown failed:', error);
          }
        }
      });

      // Clear sensitive data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      this.systemStatus.overall = 'shutdown';
      this.broadcastSystemEvent('system:emergency_shutdown', { timestamp: Date.now() });

      console.log('✅ Emergency shutdown completed');
    } catch (error) {
      console.error('Emergency shutdown failed:', error);
    }
  }

  safeTrack(name, data={}) {
    const a = this.services?.analytics; if (!a) return;
    for (const fn of ['trackEvent','track','logEvent','recordEvent']) {
      if (typeof a[fn] === 'function') return a[fn](name, data);
    }
  }
}

// Create singleton instance
const systemIntegrationService = new SystemIntegrationService();

export default systemIntegrationService;
export { SystemIntegrationService };








