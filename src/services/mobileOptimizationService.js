/**
 * Mobile Optimization Service
 * Comprehensive mobile optimization and PWA features
 */

class MobileOptimizationService {
  constructor() {
    this.isInitialized = false;
    this.deviceInfo = null;
    this.networkInfo = null;
    this.orientationInfo = null;
    this.touchGestures = new Map();
    this.performanceMetrics = {
      loadTime: 0,
      renderTime: 0,
      interactionTime: 0,
      memoryUsage: 0
    };

    this.init();
  }

  // Initialize mobile optimization
  async init() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Detect device capabilities
      await this.detectDevice();

      // Setup responsive design
      this.setupResponsiveDesign();

      // Initialize touch gestures
      this.initializeTouchGestures();

      // Setup network monitoring
      this.setupNetworkMonitoring();

      // Initialize orientation handling
      this.setupOrientationHandling();

      // Setup performance monitoring
      this.setupPerformanceMonitoring();

      // Initialize accessibility features
      this.setupAccessibility();

      this.isInitialized = true;
      console.log('Mobile optimization service initialized');
    } catch (error) {
      console.error('Failed to initialize mobile optimization:', error);
    }
  }

  // Detect device capabilities
  async detectDevice() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const maxTouchPoints = navigator.maxTouchPoints || 0;

    this.deviceInfo = {
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
      isTablet: /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|Android(?=.*\bTablet\b)/i.test(userAgent),
      isIOS: /iPad|iPhone|iPod/.test(userAgent),
      isAndroid: /Android/.test(userAgent),
      isTouchDevice: maxTouchPoints > 0 || 'ontouchstart' in window,
      platform,
      userAgent,
      maxTouchPoints,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        pixelRatio: window.devicePixelRatio || 1
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      memory: navigator.deviceMemory || 'unknown',
      cores: navigator.hardwareConcurrency || 'unknown',
      connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection
    };

    // Store device info
    localStorage.setItem('deviceInfo', JSON.stringify(this.deviceInfo));

    return this.deviceInfo;
  }

  // Setup responsive design
  setupResponsiveDesign() {
    // Create responsive breakpoints
    const breakpoints = {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    };

    // Add responsive classes to body
    const updateResponsiveClasses = () => {
      const width = window.innerWidth;
      const body = document.body;

      // Remove existing breakpoint classes
      Object.keys(breakpoints).forEach(bp => {
        body.classList.remove(`screen-${bp}`);
      });

      // Add current breakpoint class
      let currentBreakpoint = 'xs';
      Object.entries(breakpoints).forEach(([bp, minWidth]) => {
        if (width >= minWidth) {
          currentBreakpoint = bp;
        }
      });

      body.classList.add(`screen-${currentBreakpoint}`);

      // Add device type classes
      body.classList.toggle('is-mobile', this.deviceInfo.isMobile);
      body.classList.toggle('is-tablet', this.deviceInfo.isTablet);
      body.classList.toggle('is-touch', this.deviceInfo.isTouchDevice);
      body.classList.toggle('is-ios', this.deviceInfo.isIOS);
      body.classList.toggle('is-android', this.deviceInfo.isAndroid);
    };

    // Initial setup
    updateResponsiveClasses();

    // Listen for resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateResponsiveClasses, 100);
    });

    // Setup viewport meta tag
    this.setupViewportMeta();
  }

  // Setup viewport meta tag
  setupViewportMeta() {
    let viewport = document.querySelector('meta[name="viewport"]');

    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }

    // Optimize viewport for mobile
    if (this.deviceInfo.isMobile) {
      viewport.content =
        'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
    } else {
      viewport.content = 'width=device-width, initial-scale=1.0';
    }
  }

  // Initialize touch gestures
  initializeTouchGestures() {
    if (!this.deviceInfo.isTouchDevice) {
      return;
    }

    const gestureHandlers = {
      swipe: this.handleSwipe.bind(this),
      pinch: this.handlePinch.bind(this),
      tap: this.handleTap.bind(this),
      longPress: this.handleLongPress.bind(this)
    };

    // Add touch event listeners
    document.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });

    this.gestureHandlers = gestureHandlers;
  }

  // Touch event handlers
  onTouchStart(event) {
    const touch = event.touches[0];
    const touchData = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      element: event.target
    };

    this.touchGestures.set(touch.identifier, touchData);

    // Handle long press
    touchData.longPressTimer = setTimeout(() => {
      this.handleLongPress(touchData, event);
    }, 500);
  }

  onTouchMove(event) {
    event.preventDefault(); // Prevent scrolling

    Array.from(event.touches).forEach(touch => {
      const touchData = this.touchGestures.get(touch.identifier);
      if (!touchData) {
        return;
      }

      touchData.currentX = touch.clientX;
      touchData.currentY = touch.clientY;

      // Clear long press timer on move
      if (touchData.longPressTimer) {
        clearTimeout(touchData.longPressTimer);
        touchData.longPressTimer = null;
      }
    });
  }

  onTouchEnd(event) {
    Array.from(event.changedTouches).forEach(touch => {
      const touchData = this.touchGestures.get(touch.identifier);
      if (!touchData) {
        return;
      }

      touchData.endX = touch.clientX;
      touchData.endY = touch.clientY;
      touchData.endTime = Date.now();

      // Clear long press timer
      if (touchData.longPressTimer) {
        clearTimeout(touchData.longPressTimer);
        touchData.longPressTimer = null;
      }

      // Determine gesture type
      this.processGesture(touchData, event);

      // Clean up
      this.touchGestures.delete(touch.identifier);
    });
  }

  // Process gesture
  processGesture(touchData, event) {
    const deltaX = touchData.endX - touchData.startX;
    const deltaY = touchData.endY - touchData.startY;
    const deltaTime = touchData.endTime - touchData.startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Tap gesture
    if (distance < 10 && deltaTime < 300) {
      this.handleTap(touchData, event);
      return;
    }

    // Swipe gesture
    if (distance > 50 && deltaTime < 500) {
      const direction = this.getSwipeDirection(deltaX, deltaY);
      this.handleSwipe(touchData, event, direction, distance);
      return;
    }
  }

  // Get swipe direction
  getSwipeDirection(deltaX, deltaY) {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  // Gesture handlers
  handleTap(touchData, event) {
    const customEvent = new CustomEvent('mobileTap', {
      detail: { touchData, originalEvent: event }
    });
    touchData.element.dispatchEvent(customEvent);
  }

  handleSwipe(touchData, event, direction, distance) {
    const customEvent = new CustomEvent('mobileSwipe', {
      detail: { touchData, originalEvent: event, direction, distance }
    });
    touchData.element.dispatchEvent(customEvent);
  }

  handlePinch(touchData, event) {
    const customEvent = new CustomEvent('mobilePinch', {
      detail: { touchData, originalEvent: event }
    });
    touchData.element.dispatchEvent(customEvent);
  }

  handleLongPress(touchData, event) {
    const customEvent = new CustomEvent('mobileLongPress', {
      detail: { touchData, originalEvent: event }
    });
    touchData.element.dispatchEvent(customEvent);
  }

  // Setup network monitoring
  setupNetworkMonitoring() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      this.networkInfo = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };

      // Listen for network changes
      connection.addEventListener('change', () => {
        this.networkInfo = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };

        // Dispatch network change event
        window.dispatchEvent(
          new CustomEvent('networkChange', {
            detail: this.networkInfo
          })
        );

        // Optimize based on connection
        this.optimizeForConnection();
      });
    }

    // Monitor online/offline status
    window.addEventListener('online', () => {
      window.dispatchEvent(
        new CustomEvent('connectionStatusChange', {
          detail: { online: true }
        })
      );
    });

    window.addEventListener('offline', () => {
      window.dispatchEvent(
        new CustomEvent('connectionStatusChange', {
          detail: { online: false }
        })
      );
    });
  }

  // Optimize for connection
  optimizeForConnection() {
    if (!this.networkInfo) {
      return;
    }

    const { effectiveType, saveData } = this.networkInfo;

    // Adjust image quality based on connection
    const imageQuality = this.getOptimalImageQuality(effectiveType, saveData);
    document.documentElement.style.setProperty('--image-quality', imageQuality);

    // Adjust animation performance
    const animationLevel = this.getOptimalAnimationLevel(effectiveType);
    document.documentElement.style.setProperty('--animation-level', animationLevel);

    // Dispatch optimization event
    window.dispatchEvent(
      new CustomEvent('connectionOptimization', {
        detail: {
          imageQuality,
          animationLevel,
          networkInfo: this.networkInfo
        }
      })
    );
  }

  // Get optimal image quality
  getOptimalImageQuality(effectiveType, saveData) {
    if (saveData) {
      return '0.6';
    }

    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return '0.4';
      case '3g':
        return '0.7';
      case '4g':
      default:
        return '0.9';
    }
  }

  // Get optimal animation level
  getOptimalAnimationLevel(effectiveType) {
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return '0'; // No animations
      case '3g':
        return '0.5'; // Reduced animations
      case '4g':
      default:
        return '1'; // Full animations
    }
  }

  // Setup orientation handling
  setupOrientationHandling() {
    const updateOrientation = () => {
      this.orientationInfo = {
        angle: screen.orientation?.angle || window.orientation || 0,
        type: screen.orientation?.type || 'unknown'
      };

      // Add orientation classes
      document.body.classList.toggle(
        'portrait',
        this.orientationInfo.angle === 0 || this.orientationInfo.angle === 180
      );
      document.body.classList.toggle(
        'landscape',
        this.orientationInfo.angle === 90 || this.orientationInfo.angle === -90
      );

      // Dispatch orientation change event
      window.dispatchEvent(
        new CustomEvent('orientationChange', {
          detail: this.orientationInfo
        })
      );
    };

    // Initial setup
    updateOrientation();

    // Listen for orientation changes
    if (screen.orientation) {
      screen.orientation.addEventListener('change', updateOrientation);
    } else {
      window.addEventListener('orientationchange', updateOrientation);
    }
  }

  // Setup performance monitoring
  setupPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          this.performanceMetrics.loadTime = perfData.loadEventEnd - perfData.loadEventStart;
          this.performanceMetrics.renderTime = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
        }

        // Monitor memory usage
        if (performance.memory) {
          this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize;
        }

        this.reportPerformanceMetrics();
      }, 1000);
    });

    // Monitor interaction performance
    let interactionStart = 0;
    document.addEventListener('touchstart', () => {
      interactionStart = performance.now();
    });

    document.addEventListener('touchend', () => {
      if (interactionStart) {
        this.performanceMetrics.interactionTime = performance.now() - interactionStart;
        interactionStart = 0;
      }
    });
  }

  // Report performance metrics
  reportPerformanceMetrics() {
    const metrics = {
      ...this.performanceMetrics,
      deviceInfo: this.deviceInfo,
      networkInfo: this.networkInfo,
      timestamp: Date.now()
    };

    // Store metrics
    const existingMetrics = JSON.parse(localStorage.getItem('performanceMetrics') || '[]');
    existingMetrics.push(metrics);

    // Keep only last 50 entries
    if (existingMetrics.length > 50) {
      existingMetrics.splice(0, existingMetrics.length - 50);
    }

    localStorage.setItem('performanceMetrics', JSON.stringify(existingMetrics));

    // Dispatch performance event
    window.dispatchEvent(
      new CustomEvent('performanceMetrics', {
        detail: metrics
      })
    );
  }

  // Setup accessibility features
  setupAccessibility() {
    // Add touch target size optimization
    const style = document.createElement('style');
    style.textContent = `
      .touch-target {
        min-height: 44px;
        min-width: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      
      @media (pointer: coarse) {
        button, a, input, select, textarea {
          min-height: 44px;
          min-width: 44px;
        }
      }
      
      /* Reduce motion for users who prefer it */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* High contrast mode */
      @media (prefers-contrast: high) {
        * {
          border-color: currentColor !important;
        }
      }
      
      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        :root {
          --bg-primary: #1a1a1a;
          --text-primary: #ffffff;
          --border-color: #333333;
        }
      }
    `;

    document.head.appendChild(style);

    // Add focus management for touch devices
    if (this.deviceInfo.isTouchDevice) {
      document.addEventListener('touchstart', () => {
        document.body.classList.add('using-touch');
        document.body.classList.remove('using-keyboard');
      });

      document.addEventListener('keydown', () => {
        document.body.classList.add('using-keyboard');
        document.body.classList.remove('using-touch');
      });
    }
  }

  // Optimize images for mobile
  optimizeImages() {
    const images = document.querySelectorAll('img[data-mobile-optimize]');

    images.forEach(img => {
      const originalSrc = img.src;
      const quality = this.getOptimalImageQuality(
        this.networkInfo?.effectiveType || '4g',
        this.networkInfo?.saveData || false
      );

      // Create optimized image URL
      const optimizedSrc = this.createOptimizedImageUrl(originalSrc, {
        quality: parseFloat(quality),
        width: Math.min(img.clientWidth * this.deviceInfo.screenSize.pixelRatio, 1920),
        format: this.deviceInfo.isIOS ? 'heic' : 'webp'
      });

      img.src = optimizedSrc;
    });
  }

  // Create optimized image URL
  createOptimizedImageUrl(originalUrl, options) {
    const { quality, width, format } = options;

    // This would typically integrate with an image optimization service
    // For now, return original URL with query parameters
    const url = new URL(originalUrl, window.location.origin);
    url.searchParams.set('q', Math.round(quality * 100));
    url.searchParams.set('w', width);
    url.searchParams.set('f', format);

    return url.toString();
  }

  // Enable pull-to-refresh
  enablePullToRefresh(element, callback) {
    if (!this.deviceInfo.isTouchDevice) {
      return;
    }

    let startY = 0;
    let currentY = 0;
    let pulling = false;
    let refreshing = false;

    const threshold = 80;
    const maxPull = 120;

    // Create refresh indicator
    const refreshIndicator = document.createElement('div');
    refreshIndicator.className = 'pull-refresh-indicator';
    refreshIndicator.innerHTML = `
      <div class="refresh-spinner"></div>
      <div class="refresh-text">اسحب للتحديث</div>
    `;

    element.insertBefore(refreshIndicator, element.firstChild);

    element.addEventListener('touchstart', e => {
      if (element.scrollTop === 0 && !refreshing) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    });

    element.addEventListener('touchmove', e => {
      if (!pulling || refreshing) {
        return;
      }

      currentY = e.touches[0].clientY;
      const pullDistance = Math.min(currentY - startY, maxPull);

      if (pullDistance > 0) {
        e.preventDefault();

        refreshIndicator.style.transform = `translateY(${pullDistance}px)`;
        refreshIndicator.style.opacity = Math.min(pullDistance / threshold, 1);

        if (pullDistance >= threshold) {
          refreshIndicator.classList.add('ready-to-refresh');
          refreshIndicator.querySelector('.refresh-text').textContent = 'اتركه للتحديث';
        } else {
          refreshIndicator.classList.remove('ready-to-refresh');
          refreshIndicator.querySelector('.refresh-text').textContent = 'اسحب للتحديث';
        }
      }
    });

    element.addEventListener('touchend', async () => {
      if (!pulling || refreshing) {
        return;
      }

      const pullDistance = currentY - startY;

      if (pullDistance >= threshold) {
        refreshing = true;
        refreshIndicator.classList.add('refreshing');
        refreshIndicator.querySelector('.refresh-text').textContent = 'جاري التحديث...';

        try {
          await callback();
        } catch (error) {
          console.error('Refresh failed:', error);
        } finally {
          refreshing = false;
          refreshIndicator.classList.remove('refreshing', 'ready-to-refresh');
          refreshIndicator.style.transform = 'translateY(0)';
          refreshIndicator.style.opacity = '0';
          refreshIndicator.querySelector('.refresh-text').textContent = 'اسحب للتحديث';
        }
      } else {
        refreshIndicator.style.transform = 'translateY(0)';
        refreshIndicator.style.opacity = '0';
      }

      pulling = false;
      startY = 0;
      currentY = 0;
    });
  }

  // Get device info
  getDeviceInfo() {
    return this.deviceInfo;
  }

  // Get network info
  getNetworkInfo() {
    return this.networkInfo;
  }

  // Get orientation info
  getOrientationInfo() {
    return this.orientationInfo;
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return this.performanceMetrics;
  }

  // Check if device is mobile
  isMobile() {
    return this.deviceInfo?.isMobile || false;
  }

  // Check if device is tablet
  isTablet() {
    return this.deviceInfo?.isTablet || false;
  }

  // Check if device supports touch
  isTouchDevice() {
    return this.deviceInfo?.isTouchDevice || false;
  }

  // Check if connection is slow
  isSlowConnection() {
    if (!this.networkInfo) {
      return false;
    }
    return ['slow-2g', '2g'].includes(this.networkInfo.effectiveType);
  }

  // Check if user prefers reduced data
  prefersReducedData() {
    return this.networkInfo?.saveData || false;
  }
}

// Create singleton instance
const mobileOptimizationService = new MobileOptimizationService();

export default mobileOptimizationService;
export { MobileOptimizationService };
