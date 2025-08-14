// Security Service - Comprehensive security implementation
import CryptoJS from 'crypto-js';
import DOMPurify from 'dompurify';

class SecurityService {
  constructor() {
    this.encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-change-in-production';
    this.auditLogs = [];
    this.rateLimitStore = new Map();
    this.securityHeaders = {
      'Content-Security-Policy': this.generateCSP(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    this.initializeSecurity();
  }

  // Initialize security measures
  initializeSecurity() {
    this.setupCSP();
    this.setupInputValidation();
    this.setupTokenSecurity();
    this.startAuditLogging();
    this.setupErrorHandling();
  }

  // Generate Content Security Policy
  generateCSP() {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' blob:",
      "connect-src 'self' ws: wss: https://api.qasd.local http://localhost:* https://localhost:*",
      "worker-src 'self' blob:",
      "child-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      'upgrade-insecure-requests'
    ];

    return cspDirectives.join('; ');
  }

  // Setup Content Security Policy
  setupCSP() {
    // Only inject CSP meta in production. Browsers ignore some directives (e.g., frame-ancestors) via meta
    // and it can cause noisy warnings during development.
    const mode = (import.meta && import.meta.env && import.meta.env.MODE) || 'development';
    if (mode !== 'production') {
      return;
    }

    // Create meta tag for CSP
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = this.generateCSP();
    document.head.appendChild(meta);

    // Listen for CSP violations
    document.addEventListener('securitypolicyviolation', e => {
      this.logSecurityEvent('CSP_VIOLATION', {
        violatedDirective: e.violatedDirective,
        blockedURI: e.blockedURI,
        documentURI: e.documentURI,
        lineNumber: e.lineNumber,
        columnNumber: e.columnNumber,
        sourceFile: e.sourceFile
      });
    });
  }

  // Input sanitization and validation
  sanitizeInput(input, type = 'text') {
    if (typeof input !== 'string') {
      return input;
    }

    switch (type) {
      case 'html':
        return DOMPurify.sanitize(input, {
          ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
          ALLOWED_ATTR: []
        });

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) ? input.toLowerCase().trim() : '';

      case 'phone':
        return input.replace(/[^0-9+\-\s()]/g, '').trim();

      case 'number':
        const num = parseFloat(input);
        return isNaN(num) ? 0 : num;

      case 'alphanumeric':
        return input.replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '').trim();

      case 'sql':
        // Prevent SQL injection
        const sqlKeywords = [
          'SELECT',
          'INSERT',
          'UPDATE',
          'DELETE',
          'DROP',
          'CREATE',
          'ALTER',
          'EXEC',
          'EXECUTE',
          'UNION',
          'SCRIPT',
          'JAVASCRIPT',
          'VBSCRIPT'
        ];

        let sanitized = input;
        sqlKeywords.forEach(keyword => {
          const regex = new RegExp(keyword, 'gi');
          sanitized = sanitized.replace(regex, '');
        });

        return sanitized.replace(/[';"\\]/g, '').trim();

      default:
        // Basic XSS prevention
        return input
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;')
          .trim();
    }
  }

  // Validate input against patterns
  validateInput(input, rules) {
    const errors = [];

    if (rules.required && (!input || input.toString().trim() === '')) {
      errors.push('هذا الحقل مطلوب');
    }

    if (input && rules.minLength && input.length < rules.minLength) {
      errors.push(`الحد الأدنى ${rules.minLength} أحرف`);
    }

    if (input && rules.maxLength && input.length > rules.maxLength) {
      errors.push(`الحد الأقصى ${rules.maxLength} حرف`);
    }

    if (input && rules.pattern && !rules.pattern.test(input)) {
      errors.push(rules.patternMessage || 'تنسيق غير صحيح');
    }

    if (input && rules.custom && typeof rules.custom === 'function') {
      const customResult = rules.custom(input);
      if (customResult !== true) {
        errors.push(customResult);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: this.sanitizeInput(input, rules.type)
    };
  }

  // Setup input validation for forms
  setupInputValidation() {
    // Add global input event listener
    document.addEventListener('input', e => {
      const element = e.target;
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        const sanitized = this.sanitizeInput(element.value);
        if (sanitized !== element.value) {
          element.value = sanitized;
          this.logSecurityEvent('INPUT_SANITIZED', {
            elementId: element.id,
            elementName: element.name,
            originalValue: e.target.value,
            sanitizedValue: sanitized
          });
        }
      }
    });
  }

  // Token security management
  setupTokenSecurity() {
    // Secure token storage
    this.tokenStorage = {
      set: (key, value, expiry = 3600000) => {
        // 1 hour default
        const item = {
          value: this.encrypt(value),
          expiry: Date.now() + expiry,
          checksum: this.generateChecksum(value)
        };
        localStorage.setItem(key, JSON.stringify(item));
      },

      get: key => {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) {
          return null;
        }

        try {
          const item = JSON.parse(itemStr);

          // Check expiry
          if (Date.now() > item.expiry) {
            localStorage.removeItem(key);
            return null;
          }

          const decrypted = this.decrypt(item.value);

          // Verify checksum
          if (this.generateChecksum(decrypted) !== item.checksum) {
            localStorage.removeItem(key);
            this.logSecurityEvent('TOKEN_TAMPERING', { key });
            return null;
          }

          return decrypted;
        } catch (error) {
          localStorage.removeItem(key);
          return null;
        }
      },

      remove: key => {
        localStorage.removeItem(key);
      },

      clear: () => {
        localStorage.clear();
      }
    };
  }

  // Encryption/Decryption
  encrypt(text) {
    try {
      return CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      return text;
    }
  }

  decrypt(ciphertext) {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, this.encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  // Generate checksum for integrity verification
  generateChecksum(data) {
    return CryptoJS.SHA256(data + this.encryptionKey).toString();
  }

  // Rate limiting
  checkRateLimit(identifier, limit = 100, window = 60000) {
    // 100 requests per minute
    const now = Date.now();
    const windowStart = now - window;

    if (!this.rateLimitStore.has(identifier)) {
      this.rateLimitStore.set(identifier, []);
    }

    const requests = this.rateLimitStore.get(identifier);

    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);

    if (validRequests.length >= limit) {
      this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        identifier,
        requestCount: validRequests.length,
        limit,
        window
      });
      return false;
    }

    validRequests.push(now);
    this.rateLimitStore.set(identifier, validRequests);

    return true;
  }

  // Audit logging
  logSecurityEvent(eventType, details = {}) {
    // Disable security logging in development
    if (import.meta.env.DEV) return;
    
    const logEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      eventType,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      ipAddress: this.getClientIP()
    };

    this.auditLogs.push(logEntry);

    // Keep only last 1000 logs in memory
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000);
    }

    // Send to server for persistent storage
    this.sendAuditLog(logEntry);

    // Use direct console access to avoid infinite recursion
    if (this.originalConsole) {
      this.originalConsole.log('Security Event:', logEntry);
    }
  }

  // Start audit logging
  startAuditLogging() {
    // Store original console reference to avoid infinite recursion
    this.originalConsole = window.console;

    // Log page visits
    this.logSecurityEvent('PAGE_VISIT', {
      page: window.location.pathname,
      referrer: document.referrer
    });

    // Log authentication events
    window.addEventListener('storage', e => {
      if (e.key === 'auth_token') {
        this.logSecurityEvent('AUTH_TOKEN_CHANGE', {
          oldValue: e.oldValue ? 'present' : 'absent',
          newValue: e.newValue ? 'present' : 'absent'
        });
      }
    });

    // Log console access attempts (but exclude our own security logging)
    const originalConsole = window.console;
    const self = this;
    window.console = new Proxy(originalConsole, {
      get: (target, prop) => {
        if (typeof target[prop] === 'function') {
          return new Proxy(target[prop], {
            apply: (fn, thisArg, args) => {
              // Avoid logging our own security events to prevent infinite recursion
              const isSecurityLog =
                args.length > 0 && typeof args[0] === 'string' && args[0].includes('Security Event:');

              if (!isSecurityLog) {
                self.logSecurityEvent('CONSOLE_ACCESS', {
                  method: prop,
                  args: args.map(arg => (typeof arg === 'string' ? arg.substring(0, 100) : typeof arg))
                });
              }
              return fn.apply(thisArg, args);
            }
          });
        }
        return target[prop];
      }
    });
  }

  // Send audit log to server
  async sendAuditLog(logEntry) {
    try {
      // TODO: Implement security audit endpoint in backend
      // For now, just store logs locally to prevent failed API calls
      console.log('Security audit log (backend endpoint not implemented):', logEntry);
      return;

      // await fetch('/api/security/audit', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${this.tokenStorage.get('auth_token')}`
      //   },
      //   body: JSON.stringify(logEntry)
      // });
    } catch (error) {
      // Store failed logs for retry
      const failedLogs = JSON.parse(localStorage.getItem('failed_audit_logs') || '[]');
      failedLogs.push(logEntry);
      localStorage.setItem('failed_audit_logs', JSON.stringify(failedLogs.slice(-100)));
    }
  }

  // Setup error handling
  setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', e => {
      this.logSecurityEvent('JAVASCRIPT_ERROR', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error?.stack?.substring(0, 500)
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', e => {
      this.logSecurityEvent('UNHANDLED_PROMISE_REJECTION', {
        reason: e.reason?.toString?.()?.substring(0, 500) || 'Unknown'
      });
    });
  }

  // Security headers for API requests
  getSecurityHeaders() {
    return {
      ...this.securityHeaders,
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-Token': this.getCSRFToken()
    };
  }

  // Generate CSRF token
  getCSRFToken() {
    let token = this.tokenStorage.get('csrf_token');
    if (!token) {
      token = this.generateId();
      this.tokenStorage.set('csrf_token', token, 86400000); // 24 hours
    }
    return token;
  }

  // Secure API request wrapper
  async secureRequest(url, options = {}) {
    // Check rate limit
    const identifier = this.getCurrentUserId() || this.getClientIP();
    if (!this.checkRateLimit(identifier)) {
      throw new Error('معدل الطلبات مرتفع جداً. يرجى المحاولة لاحقاً.');
    }

    // Add security headers
    const secureOptions = {
      ...options,
      headers: {
        ...this.getSecurityHeaders(),
        ...options.headers
      }
    };

    // Sanitize request body
    if (secureOptions.body && typeof secureOptions.body === 'string') {
      try {
        const bodyData = JSON.parse(secureOptions.body);
        const sanitizedData = this.sanitizeObject(bodyData);
        secureOptions.body = JSON.stringify(sanitizedData);
      } catch (error) {
        // Not JSON, sanitize as text
        secureOptions.body = this.sanitizeInput(secureOptions.body);
      }
    }

    this.logSecurityEvent('API_REQUEST', {
      url,
      method: secureOptions.method || 'GET',
      hasBody: !!secureOptions.body
    });

    try {
      const response = await fetch(url, secureOptions);

      this.logSecurityEvent('API_RESPONSE', {
        url,
        status: response.status,
        statusText: response.statusText
      });

      return response;
    } catch (error) {
      this.logSecurityEvent('API_ERROR', {
        url,
        error: error.message
      });
      throw error;
    }
  }

  // Sanitize object recursively
  sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return this.sanitizeInput(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = this.sanitizeInput(key, 'alphanumeric');
      sanitized[sanitizedKey] = this.sanitizeObject(value);
    }

    return sanitized;
  }

  // Utility functions
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getCurrentUserId() {
    try {
      const token = this.tokenStorage.get('auth_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      }
    } catch (error) {
      // Invalid token
    }
    return null;
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  getClientIP() {
    // This would typically be set by the server
    return localStorage.getItem('client_ip') || 'unknown';
  }

  // Get audit logs
  getAuditLogs(filter = {}) {
    let logs = [...this.auditLogs];

    if (filter.eventType) {
      logs = logs.filter(log => log.eventType === filter.eventType);
    }

    if (filter.userId) {
      logs = logs.filter(log => log.userId === filter.userId);
    }

    if (filter.startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(filter.startDate));
    }

    if (filter.endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= new Date(filter.endDate));
    }

    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Security health check
  getSecurityStatus() {
    const recentLogs = this.getAuditLogs({
      startDate: new Date(Date.now() - 3600000) // Last hour
    });

    const securityEvents = recentLogs.filter(log =>
      ['CSP_VIOLATION', 'RATE_LIMIT_EXCEEDED', 'TOKEN_TAMPERING', 'JAVASCRIPT_ERROR'].includes(log.eventType)
    );

    return {
      status: securityEvents.length === 0 ? 'secure' : 'warning',
      totalEvents: recentLogs.length,
      securityEvents: securityEvents.length,
      lastSecurityEvent: securityEvents[0]?.timestamp || null,
      rateLimitStatus: this.rateLimitStore.size,
      tokenStatus: !!this.tokenStorage.get('auth_token'),
      cspEnabled: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    };
  }

  // Clear security data
  clearSecurityData() {
    this.auditLogs = [];
    this.rateLimitStore.clear();
    this.tokenStorage.clear();
    sessionStorage.clear();

    this.logSecurityEvent('SECURITY_DATA_CLEARED');
  }
}

// Create singleton instance
const securityService = new SecurityService();

export default securityService;
