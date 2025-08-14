import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load homepage within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
    
    console.log(`Homepage loaded in ${loadTime}ms`);
  });

  test('should load documents page within 2 seconds', async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      }));
    });
    
    const startTime = Date.now();
    
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
    
    console.log(`Documents page loaded in ${loadTime}ms`);
  });

  test('should load reports page within 2 seconds', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      }));
    });
    
    const startTime = Date.now();
    
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
    
    console.log(`Reports page loaded in ${loadTime}ms`);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};
        
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (simulated)
        vitals.fid = 0; // Will be 0 in automated tests
        
        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Wait a bit for measurements
        setTimeout(() => resolve(vitals), 3000);
      });
    });
    
    // LCP should be under 2.5 seconds (2500ms)
    expect(vitals.lcp).toBeLessThan(2500);
    
    // CLS should be under 0.1
    expect(vitals.cls).toBeLessThan(0.1);
    
    console.log('Core Web Vitals:', vitals);
  });

  test('should handle large document lists efficiently', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      }));
    });
    
    // Mock a large number of documents
    await page.route('/api/documents', (route) => {
      const documents = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        title: `Document ${i + 1}`,
        type: 'report',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: documents })
      });
    });
    
    const startTime = Date.now();
    
    await page.goto('/documents');
    await page.waitForSelector('[data-testid="document-list"]');
    
    const renderTime = Date.now() - startTime;
    expect(renderTime).toBeLessThan(3000); // Allow 3 seconds for large lists
    
    console.log(`Large document list rendered in ${renderTime}ms`);
  });

  test('should scroll smoothly through document list', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      }));
    });
    
    await page.goto('/documents');
    await page.waitForSelector('[data-testid="document-list"]');
    
    // Measure scroll performance
    const scrollPerformance = await page.evaluate(() => {
      return new Promise((resolve) => {
        const container = document.querySelector('[data-testid="document-list"]');
        let frameCount = 0;
        let startTime = performance.now();
        
        function measureFrame() {
          frameCount++;
          if (frameCount < 60) { // Measure for 60 frames
            requestAnimationFrame(measureFrame);
          } else {
            const endTime = performance.now();
            const fps = 60 / ((endTime - startTime) / 1000);
            resolve({ fps, duration: endTime - startTime });
          }
        }
        
        // Start scrolling
        container.scrollTop = 0;
        let scrollPosition = 0;
        const scrollInterval = setInterval(() => {
          scrollPosition += 50;
          container.scrollTop = scrollPosition;
          if (scrollPosition >= container.scrollHeight - container.clientHeight) {
            clearInterval(scrollInterval);
          }
        }, 16); // ~60fps
        
        requestAnimationFrame(measureFrame);
      });
    });
    
    // Should maintain at least 30 FPS during scrolling
    expect(scrollPerformance.fps).toBeGreaterThan(30);
    
    console.log(`Scroll performance: ${scrollPerformance.fps.toFixed(2)} FPS`);
  });

  test('should load images efficiently', async ({ page }) => {
    await page.goto('/');
    
    // Wait for all images to load
    await page.waitForFunction(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.every(img => img.complete);
    });
    
    // Check image loading performance
    const imageMetrics = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.map(img => ({
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      }));
    });
    
    // All images should be loaded
    imageMetrics.forEach(img => {
      expect(img.complete).toBe(true);
      expect(img.naturalWidth).toBeGreaterThan(0);
      expect(img.naturalHeight).toBeGreaterThan(0);
    });
    
    console.log(`Loaded ${imageMetrics.length} images successfully`);
  });

  test('should handle concurrent API requests efficiently', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      }));
    });
    
    // Mock API responses with delays
    await page.route('/api/**', (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [], success: true })
        });
      }, 100); // 100ms delay
    });
    
    const startTime = Date.now();
    
    // Navigate to dashboard which makes multiple API calls
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const totalTime = Date.now() - startTime;
    
    // Should handle concurrent requests efficiently
    expect(totalTime).toBeLessThan(2000);
    
    console.log(`Dashboard with concurrent API calls loaded in ${totalTime}ms`);
  });
});