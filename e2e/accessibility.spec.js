import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('documents page should have no accessibility violations', async ({ page }) => {
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
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('reports page should have no accessibility violations', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      }));
    });
    
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test Tab navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
    
    // Continue tabbing through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(() => document.activeElement.tagName);
      expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focusedElement);
    }
  });

  test('should support screen reader navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
    
    // Verify h1 exists and is unique
    const h1Elements = await page.locator('h1').all();
    expect(h1Elements.length).toBe(1);
    
    // Check for proper landmark roles
    const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer').all();
    expect(landmarks.length).toBeGreaterThan(0);
  });

  test('should have proper form labels and descriptions', async ({ page }) => {
    await page.goto('/login');
    
    // Check that all form inputs have labels
    const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"], textarea, select').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        expect(label > 0 || ariaLabel || ariaLabelledby).toBeTruthy();
      } else {
        expect(ariaLabel || ariaLabelledby).toBeTruthy();
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('*')
      .analyze();
    
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    
    expect(colorContrastViolations).toEqual([]);
  });

  test('should support high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    await page.goto('/');
    
    // Verify elements are still visible and functional
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      await expect(button).toBeVisible();
    }
    
    const links = await page.locator('a').all();
    for (const link of links) {
      await expect(link).toBeVisible();
    }
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    
    // Check that animations respect reduced motion
    const animatedElements = await page.locator('[class*="animate"], [class*="transition"]').all();
    
    for (const element of animatedElements) {
      const computedStyle = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          animationDuration: style.animationDuration,
          transitionDuration: style.transitionDuration
        };
      });
      
      // Animations should be disabled or very short
      expect(
        computedStyle.animationDuration === '0s' || 
        computedStyle.transitionDuration === '0s' ||
        computedStyle.animationDuration === '0.01s' ||
        computedStyle.transitionDuration === '0.01s'
      ).toBeTruthy();
    }
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/');
    
    // Test focus indicators on interactive elements
    const interactiveElements = await page.locator('button, a, input, select, textarea, [tabindex]').all();
    
    for (let i = 0; i < Math.min(interactiveElements.length, 5); i++) {
      const element = interactiveElements[i];
      await element.focus();
      
      // Check if element has visible focus indicator
      const focusStyles = await element.evaluate(el => {
        const style = window.getComputedStyle(el, ':focus');
        return {
          outline: style.outline,
          outlineWidth: style.outlineWidth,
          outlineStyle: style.outlineStyle,
          outlineColor: style.outlineColor,
          boxShadow: style.boxShadow
        };
      });
      
      const hasFocusIndicator = 
        focusStyles.outline !== 'none' ||
        focusStyles.outlineWidth !== '0px' ||
        focusStyles.boxShadow !== 'none';
      
      expect(hasFocusIndicator).toBeTruthy();
    }
  });

  test('should support zoom up to 200%', async ({ page }) => {
    await page.goto('/');
    
    // Set zoom to 200%
    await page.setViewportSize({ width: 640, height: 480 }); // Simulate 200% zoom
    
    // Verify content is still accessible and functional
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Check that no horizontal scrolling is required
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper ARIA attributes
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include('*')
      .analyze();
    
    const ariaViolations = accessibilityScanResults.violations.filter(
      violation => violation.id.includes('aria')
    );
    
    expect(ariaViolations).toEqual([]);
  });

  test('should support RTL (Arabic) layout', async ({ page }) => {
    // Set page to Arabic/RTL
    await page.goto('/');
    await page.evaluate(() => {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    });
    
    // Verify RTL layout works correctly
    const bodyDirection = await page.evaluate(() => {
      return window.getComputedStyle(document.body).direction;
    });
    
    expect(bodyDirection).toBe('rtl');
    
    // Verify no accessibility violations in RTL mode
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});