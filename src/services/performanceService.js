import React from 'react';

// تحديد المكونات المتاحة باستخدام import.meta.glob (مع حماية بيئة الاختبار)
const globFn = (pattern, opts) => {
  try {
    // Using eval to avoid Jest parsing import.meta
    // eslint-disable-next-line no-eval
    return eval('import.meta').glob(pattern, opts);
  } catch {
    // Fallback for Jest: minimal stub map
    return {};
  }
};
const pages = globFn('../pages/**/*.jsx', { eager: false });
const components = globFn('../components/**/*.jsx', { eager: false });

/**
 * تحميل مكون بناءً على اسمه
 * @param {string} componentName - اسم المكون (مثل 'Dashboard' أو 'sales/SalesPage')
 * @returns {Promise<React.Component>} المكون المحمل
 */
export async function loadComponentByName(componentName) {
  try {
    // البحث في صفحات التطبيق
    let componentKey = Object.keys(pages).find(key => {
      const normalizedKey = key.replace('../pages/', '').replace('.jsx', '');
      return (
        normalizedKey.endsWith(`/${componentName}`) ||
        normalizedKey.endsWith(`/${componentName}/index`) ||
        normalizedKey === componentName ||
        normalizedKey.split('/').pop() === componentName
      );
    });

    // إذا لم نجد في الصفحات، ابحث في المكونات
    if (!componentKey) {
      componentKey = Object.keys(components).find(key => {
        const normalizedKey = key.replace('../components/', '').replace('.jsx', '');
        return (
          normalizedKey.endsWith(`/${componentName}`) ||
          normalizedKey.endsWith(`/${componentName}/index`) ||
          normalizedKey === componentName ||
          normalizedKey.split('/').pop() === componentName
        );
      });
    }

    if (!componentKey) {
      throw new Error(`Component not found: ${componentName}`);
    }

    // تحميل المكون
    const moduleLoader = pages[componentKey] || components[componentKey];
    const module = await moduleLoader();
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load component '${componentName}':`, error);
    throw error;
  }
}

// Performance Service - Comprehensive performance optimization
class PerformanceService {
  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      timeToInteractive: 0
    };

    this.cache = new Map();
    this.imageCache = new Map();
    this.apiCache = new Map();
    this.observers = [];
    this.methodCalls = [];

    this.initializePerformanceMonitoring();
    this.setupCaching();
    this.setupImageOptimization();
  }

  // Initialize performance monitoring
  initializePerformanceMonitoring() {
    // Skip heavy monitoring in non-browser test environments
    if (typeof window === 'undefined' || typeof performance === 'undefined' || !performance || typeof performance.getEntriesByType !== 'function') {
      return;
    }

    // Wait for page to load
    if (document?.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.measurePerformance();
      });
    } else {
      this.measurePerformance();
    }

    // Setup performance observer
    this.setupPerformanceObserver();

    // Monitor resource loading
    this.monitorResourceLoading();

    // Setup memory monitoring
    this.setupMemoryMonitoring();
  }

  // Measure core web vitals and performance metrics
  measurePerformance() {
    // Page Load Time
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
    }

    // First Contentful Paint
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry) {
      this.metrics.firstContentfulPaint = fcpEntry.startTime;
    }

    // Largest Contentful Paint
    this.measureLCP();

    // First Input Delay
    this.measureFID();

    // Cumulative Layout Shift
    this.measureCLS();

    // Time to Interactive
    this.measureTTI();

    console.log('Performance Metrics:', this.metrics);
  }

  // Setup Performance Observer
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      // Observe paint metrics
      const paintObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // Observe layout shifts
      const clsObserver = new PerformanceObserver(list => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cumulativeLayoutShift += clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // Observe first input delay
      const fidObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    }
  }

  // Measure Largest Contentful Paint
  measureLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  // Measure First Input Delay
  measureFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  // Measure Cumulative Layout Shift
  measureCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  // Measure Time to Interactive
  measureTTI() {
    // Simplified TTI calculation
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      this.metrics.timeToInteractive = navigation.domInteractive - navigation.navigationStart;
    }
  }

  // Monitor resource loading
  monitorResourceLoading() {
    const resourceObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 1000) {
          // Resources taking more than 1 second
          console.warn('Slow resource detected:', {
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize
          });
        }
      }
    });

    if ('PerformanceObserver' in window) {
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    }
  }

  // Setup memory monitoring
  setupMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const memoryUsage = {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
        };

        // Warn if memory usage is high
        if (memoryUsage.used / memoryUsage.limit > 0.8) {
          console.warn('High memory usage detected:', memoryUsage);
          this.optimizeMemory();
        }
      }, 30000); // Check every 30 seconds
    }
  }

  // Setup intelligent caching
  setupCaching() {
    // API response caching
    this.apiCacheConfig = {
      '/api/dashboard': { ttl: 300000, priority: 'high' }, // 5 minutes
      '/api/production': { ttl: 60000, priority: 'high' }, // 1 minute
      '/api/quality': { ttl: 180000, priority: 'medium' }, // 3 minutes
      '/api/inventory': { ttl: 600000, priority: 'low' }, // 10 minutes
      '/api/reports': { ttl: 1800000, priority: 'low' } // 30 minutes
    };

    // Setup cache cleanup
    setInterval(() => {
      this.cleanupCache();
    }, 60000); // Cleanup every minute
  }

  // Cache API response
  cacheApiResponse(url, data, customTTL = null) {
    const config = this.apiCacheConfig[url] || { ttl: 300000, priority: 'medium' };
    const ttl = customTTL || config.ttl;

    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      priority: config.priority,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    this.apiCache.set(url, cacheEntry);

    // Limit cache size
    if (this.apiCache.size > 100) {
      this.evictLeastUsedCache();
    }
  }

  // Get cached API response
  getCachedApiResponse(url) {
    const cacheEntry = this.apiCache.get(url);

    if (!cacheEntry) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - cacheEntry.timestamp > cacheEntry.ttl) {
      this.apiCache.delete(url);
      return null;
    }

    // Update access statistics
    cacheEntry.accessCount++;
    cacheEntry.lastAccessed = Date.now();

    return cacheEntry.data;
  }

  // Evict least used cache entries
  evictLeastUsedCache() {
    const entries = Array.from(this.apiCache.entries());

    // Sort by priority and access count
    entries.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a[1].priority] || 1;
      const bPriority = priorityWeight[b[1].priority] || 1;

      if (aPriority !== bPriority) {
        return aPriority - bPriority; // Lower priority first
      }

      return a[1].accessCount - b[1].accessCount; // Lower access count first
    });

    // Remove bottom 20% of entries
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.apiCache.delete(entries[i][0]);
    }
  }

  // Cleanup expired cache entries
  cleanupCache() {
    const now = Date.now();

    // Cleanup API cache
    for (const [url, entry] of this.apiCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.apiCache.delete(url);
      }
    }

    // Cleanup image cache
    for (const [url, entry] of this.imageCache.entries()) {
      if (now - entry.timestamp > 3600000) {
        // 1 hour
        this.imageCache.delete(url);
      }
    }
  }

  // Image optimization and lazy loading
  setupImageOptimization() {
    // Setup intersection observer for lazy loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              this.loadImage(img);
              imageObserver.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );

      // Observe all images with data-src attribute
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });

      this.observers.push(imageObserver);
    }
  }

  // Load and optimize image
  async loadImage(img) {
    const src = img.dataset.src;
    if (!src) {
      return;
    }

    try {
      // Check cache first
      const cached = this.imageCache.get(src);
      if (cached) {
        img.src = cached.optimizedSrc;
        img.classList.add('loaded');
        return;
      }

      // Load and optimize image
      const optimizedSrc = await this.optimizeImage(src);

      // Cache the optimized image
      this.imageCache.set(src, {
        optimizedSrc,
        timestamp: Date.now()
      });

      // Set image source
      img.src = optimizedSrc;
      img.classList.add('loaded');
    } catch (error) {
      console.error('Failed to load image:', src, error);
      img.src = src; // Fallback to original
    }
  }

  // Optimize image (resize, compress, format conversion)
  async optimizeImage(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate optimal dimensions
        const maxWidth = window.innerWidth;
        const maxHeight = window.innerHeight;

        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP if supported, otherwise JPEG
        const format = this.supportsWebP() ? 'webp' : 'jpeg';
        const quality = 0.8;

        const optimizedSrc = canvas.toDataURL(`image/${format}`, quality);
        resolve(optimizedSrc);
      };

      img.onerror = () => {
        resolve(src); // Fallback to original
      };

      img.src = src;
    });
  }

  // Check WebP support
  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  // Code splitting and lazy loading - استبدال الاستيراد الديناميكي
  async loadComponent(componentName) {
    try {
      // التحقق من الكاش أولاً
      if (this.cache.has(componentName)) {
        return this.cache.get(componentName);
      }

      // تحميل المكون باستخدام الدالة الآمنة
      const component = await loadComponentByName(componentName);

      // حفظ المكون في الكاش
      this.cache.set(componentName, component);

      return component;
    } catch (error) {
      console.error('Failed to load component:', componentName, error);
      // إرجاع مكون خطأ بدلاً من رمي الخطأ
      return () => React.createElement('div', {
        className: 'p-4 text-red-600 bg-red-50 rounded-lg'
      }, `خطأ في تحميل المكون: ${componentName}`);
    }
  }

  // Preload critical resources
  preloadCriticalResources() {
    const criticalResources = ['/api/auth/me', '/api/reports/dashboard', '/static/css/main.css', '/static/js/vendor.js'];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;

      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      } else {
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
      }

      document.head.appendChild(link);
    });
  }

  // Optimize memory usage
  optimizeMemory() {
    // Clear old cache entries
    this.cleanupCache();

    // Clear unused observers
    this.observers = this.observers.filter(observer => {
      try {
        // Test if observer is still active
        observer.takeRecords();
        return true;
      } catch (error) {
        observer.disconnect();
        return false;
      }
    });

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }

    console.log('Memory optimization completed');
  }

  // Bundle analysis and optimization
  analyzeBundleSize() {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

    const analysis = {
      scripts: scripts.map(script => ({
        src: script.src,
        async: script.async,
        defer: script.defer
      })),
      styles: styles.map(style => ({
        href: style.href,
        media: style.media
      })),
      totalScripts: scripts.length,
      totalStyles: styles.length
    };

    console.log('Bundle Analysis:', analysis);
    return analysis;
  }

  // Database query optimization (for IndexedDB)
  async optimizeIndexedDBQuery(storeName, query) {
    const cacheKey = `idb_${storeName}_${JSON.stringify(query)}`;

    // Check cache first
    const cached = this.getCachedApiResponse(cacheKey);
    if (cached) {
      return cached;
    }

    // Execute query (this would be implemented based on your IndexedDB setup)
    const result = await this.executeIndexedDBQuery(storeName, query);

    // Cache result
    this.cacheApiResponse(cacheKey, result, 300000); // 5 minutes

    return result;
  }

  // Execute IndexedDB query (placeholder)
  async executeIndexedDBQuery(storeName, query) {
    // This would be implemented based on your specific IndexedDB setup
    console.log('Executing IndexedDB query:', storeName, query);
    return [];
  }

  // Performance report
  // Track method calls for performance monitoring
  trackMethodCall(callData) {
    try {
      const { service, method, duration, success, error, timestamp } = callData;
      
      // Initialize method tracking if not exists
      if (!this.methodCalls) {
        this.methodCalls = [];
      }
      
      // Store method call data
      this.methodCalls.push({
        service,
        method,
        duration,
        success,
        error,
        timestamp: timestamp || Date.now()
      });
      
      // Keep only last 1000 method calls to prevent memory issues
      if (this.methodCalls.length > 1000) {
        this.methodCalls = this.methodCalls.slice(-1000);
      }
      
      // Update performance metrics if duration is significant
      if (duration > 100) {
        this.metrics.slowMethodCalls = (this.metrics.slowMethodCalls || 0) + 1;
      }
      
      // Track errors
      if (!success && error) {
        this.metrics.methodCallErrors = (this.metrics.methodCallErrors || 0) + 1;
      }
      
    } catch (trackingError) {
      console.warn('Error tracking method call:', trackingError);
    }
  }

  getPerformanceReport() {
    const report = {
      metrics: { ...this.metrics },
      cacheStats: {
        apiCacheSize: this.apiCache.size,
        imageCacheSize: this.imageCache.size,
        totalCacheSize: this.cache.size
      },
      methodCalls: {
        total: this.methodCalls ? this.methodCalls.length : 0,
        recent: this.methodCalls ? this.methodCalls.slice(-10) : [],
        slowCalls: this.metrics.slowMethodCalls || 0,
        errors: this.metrics.methodCallErrors || 0
      },
      memoryUsage:
        'memory' in performance
          ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576),
            total: Math.round(performance.memory.totalJSHeapSize / 1048576),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
          }
          : null,
      recommendations: this.getPerformanceRecommendations()
    };

    return report;
  }

  // Get performance recommendations
  getPerformanceRecommendations() {
    const recommendations = [];

    if (this.metrics.firstContentfulPaint > 2500) {
      recommendations.push('تحسين وقت الرسم الأول للمحتوى - يجب أن يكون أقل من 2.5 ثانية');
    }

    if (this.metrics.largestContentfulPaint > 4000) {
      recommendations.push('تحسين وقت الرسم الأكبر للمحتوى - يجب أن يكون أقل من 4 ثوانٍ');
    }

    if (this.metrics.firstInputDelay > 100) {
      recommendations.push('تحسين تأخير الإدخال الأول - يجب أن يكون أقل من 100 مللي ثانية');
    }

    if (this.metrics.cumulativeLayoutShift > 0.25) {
      recommendations.push('تقليل التحول التراكمي للتخطيط - يجب أن يكون أقل من 0.25');
    }

    if (this.apiCache.size > 80) {
      recommendations.push('تنظيف ذاكرة التخزين المؤقت للـ API - حجم كبير جداً');
    }

    return recommendations;
  }

  // Cleanup on page unload
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.cache.clear();
  }
}

// Create singleton instance
const performanceService = new PerformanceService();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  performanceService.cleanup();
});

export default performanceService;
