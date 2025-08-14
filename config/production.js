// Production Configuration for QASD Application
// Comprehensive production settings for enterprise deployment

const path = require('path');
const os = require('os');

// Environment validation
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'API_BASE_URL',
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'ENCRYPTION_KEY'
];

// Validate required environment variables
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

module.exports = {
  // Application Configuration
  app: {
    name: process.env.APP_NAME || 'QASD',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    port: parseInt(process.env.PORT) || 5000,
    host: process.env.HOST || '0.0.0.0',
    timezone: process.env.TZ || 'UTC',
    locale: process.env.DEFAULT_LOCALE || 'ar',
    debug: process.env.DEBUG === 'true',
    maintenance: process.env.MAINTENANCE_MODE === 'true'
  },

  // Server Configuration
  server: {
    // Cluster configuration
    cluster: {
      enabled: process.env.CLUSTER_ENABLED !== 'false',
      workers: parseInt(process.env.CLUSTER_WORKERS) || os.cpus().length,
      maxMemory: process.env.MAX_MEMORY || '512M'
    },

    // HTTP/HTTPS Configuration
    ssl: {
      enabled: process.env.SSL_ENABLED === 'true',
      cert: process.env.SSL_CERT_PATH || '/etc/ssl/certs/qasd.crt',
      key: process.env.SSL_KEY_PATH || '/etc/ssl/private/qasd.key',
      ca: process.env.SSL_CA_PATH,
      passphrase: process.env.SSL_PASSPHRASE,
      dhparam: process.env.SSL_DHPARAM_PATH
    },

    // Request limits
    limits: {
      bodySize: process.env.MAX_BODY_SIZE || '50mb',
      fileSize: process.env.MAX_FILE_SIZE || '100mb',
      requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
      headerTimeout: parseInt(process.env.HEADER_TIMEOUT) || 60000,
      keepAliveTimeout: parseInt(process.env.KEEP_ALIVE_TIMEOUT) || 5000
    },

    // Compression
    compression: {
      enabled: process.env.COMPRESSION_ENABLED !== 'false',
      level: parseInt(process.env.COMPRESSION_LEVEL) || 6,
      threshold: parseInt(process.env.COMPRESSION_THRESHOLD) || 1024
    }
  },

  // Database Configuration
  database: {
    // Primary database
    primary: {
      url: process.env.DATABASE_URL,
      type: process.env.DB_TYPE || 'postgresql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      name: process.env.DB_NAME || 'qasd',
      username: process.env.DB_USER || 'qasd',
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true',
      pool: {
        min: parseInt(process.env.DB_POOL_MIN) || 2,
        max: parseInt(process.env.DB_POOL_MAX) || 20,
        idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
        acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 60000,
        evict: parseInt(process.env.DB_POOL_EVICT) || 1000
      },
      options: {
        logging: process.env.DB_LOGGING === 'true',
        timezone: process.env.DB_TIMEZONE || 'UTC',
        dialectOptions: {
          ssl: process.env.DB_SSL === 'true' ? {
            require: true,
            rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
          } : false
        }
      }
    },

    // Read replica (if configured)
    replica: {
      enabled: process.env.DB_REPLICA_ENABLED === 'true',
      url: process.env.DB_REPLICA_URL,
      host: process.env.DB_REPLICA_HOST,
      port: parseInt(process.env.DB_REPLICA_PORT) || 5432
    }
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'qasd:',
    
    // Connection options
    options: {
      connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT) || 10000,
      commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT) || 5000,
      retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY) || 100,
      maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES) || 3,
      lazyConnect: true,
      keepAlive: parseInt(process.env.REDIS_KEEP_ALIVE) || 30000
    },

    // Cluster configuration (if using Redis Cluster)
    cluster: {
      enabled: process.env.REDIS_CLUSTER_ENABLED === 'true',
      nodes: process.env.REDIS_CLUSTER_NODES ? 
        process.env.REDIS_CLUSTER_NODES.split(',').map(node => {
          const [host, port] = node.split(':');
          return { host, port: parseInt(port) || 6379 };
        }) : []
    }
  },

  // API Configuration
  api: {
    baseUrl: process.env.API_BASE_URL,
    version: process.env.API_VERSION || 'v1',
    prefix: process.env.API_PREFIX || '/api',
    
    // Rate limiting
    rateLimit: {
      enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
      message: process.env.RATE_LIMIT_MESSAGE || 'Too many requests',
      standardHeaders: true,
      legacyHeaders: false
    },

    // CORS configuration
    cors: {
      enabled: process.env.CORS_ENABLED !== 'false',
      origin: process.env.CORS_ORIGIN ? 
        process.env.CORS_ORIGIN.split(',') : 
        ['https://qasd.example.com'],
      credentials: process.env.CORS_CREDENTIALS === 'true',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },

    // Request validation
    validation: {
      enabled: process.env.API_VALIDATION_ENABLED !== 'false',
      stripUnknown: process.env.API_STRIP_UNKNOWN === 'true',
      abortEarly: process.env.API_ABORT_EARLY === 'true'
    }
  },

  // Authentication & Authorization
  auth: {
    // JWT Configuration
    jwt: {
      secret: process.env.JWT_SECRET,
      algorithm: process.env.JWT_ALGORITHM || 'HS256',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: process.env.JWT_ISSUER || 'qasd',
      audience: process.env.JWT_AUDIENCE || 'qasd-users'
    },

    // Session configuration
    session: {
      enabled: process.env.SESSION_ENABLED === 'true',
      secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
      name: process.env.SESSION_NAME || 'qasd.sid',
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000, // 24 hours
      secure: process.env.SESSION_SECURE !== 'false',
      httpOnly: process.env.SESSION_HTTP_ONLY !== 'false',
      sameSite: process.env.SESSION_SAME_SITE || 'strict'
    },

    // OAuth providers
    oauth: {
      google: {
        enabled: process.env.GOOGLE_OAUTH_ENABLED === 'true',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL
      },
      microsoft: {
        enabled: process.env.MICROSOFT_OAUTH_ENABLED === 'true',
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackUrl: process.env.MICROSOFT_CALLBACK_URL
      }
    },

    // Password policy
    password: {
      minLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
      requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
      requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
      requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
      requireSymbols: process.env.PASSWORD_REQUIRE_SYMBOLS !== 'false',
      maxAge: parseInt(process.env.PASSWORD_MAX_AGE) || 90, // days
      historyCount: parseInt(process.env.PASSWORD_HISTORY_COUNT) || 5
    },

    // Account lockout
    lockout: {
      enabled: process.env.ACCOUNT_LOCKOUT_ENABLED !== 'false',
      maxAttempts: parseInt(process.env.LOCKOUT_MAX_ATTEMPTS) || 5,
      lockoutDuration: parseInt(process.env.LOCKOUT_DURATION) || 900000, // 15 minutes
      resetOnSuccess: process.env.LOCKOUT_RESET_ON_SUCCESS !== 'false'
    }
  },

  // Security Configuration
  security: {
    // Encryption
    encryption: {
      key: process.env.ENCRYPTION_KEY,
      algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
      keyDerivation: {
        algorithm: process.env.KEY_DERIVATION_ALGORITHM || 'pbkdf2',
        iterations: parseInt(process.env.KEY_DERIVATION_ITERATIONS) || 100000,
        keyLength: parseInt(process.env.KEY_DERIVATION_LENGTH) || 32,
        digest: process.env.KEY_DERIVATION_DIGEST || 'sha512'
      }
    },

    // HTTPS enforcement
    https: {
      enforced: process.env.HTTPS_ENFORCED !== 'false',
      trustProxy: process.env.TRUST_PROXY === 'true',
      hsts: {
        enabled: process.env.HSTS_ENABLED !== 'false',
        maxAge: parseInt(process.env.HSTS_MAX_AGE) || 31536000, // 1 year
        includeSubDomains: process.env.HSTS_INCLUDE_SUBDOMAINS !== 'false',
        preload: process.env.HSTS_PRELOAD === 'true'
      }
    },

    // Content Security Policy
    csp: {
      enabled: process.env.CSP_ENABLED !== 'false',
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'https:'],
        connectSrc: ["'self'"],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        childSrc: ["'self'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"]
      },
      reportOnly: process.env.CSP_REPORT_ONLY === 'true',
      reportUri: process.env.CSP_REPORT_URI
    },

    // Input sanitization
    sanitization: {
      enabled: process.env.INPUT_SANITIZATION_ENABLED !== 'false',
      allowedTags: process.env.ALLOWED_HTML_TAGS ? 
        process.env.ALLOWED_HTML_TAGS.split(',') : 
        ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      allowedAttributes: {
        'a': ['href', 'title'],
        'img': ['src', 'alt', 'title']
      }
    }
  },

  // File Upload Configuration
  upload: {
    enabled: process.env.FILE_UPLOAD_ENABLED !== 'false',
    destination: process.env.UPLOAD_DESTINATION || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 104857600, // 100MB
    maxFiles: parseInt(process.env.MAX_FILES_PER_REQUEST) || 10,
    
    // Allowed file types
    allowedTypes: process.env.ALLOWED_FILE_TYPES ? 
      process.env.ALLOWED_FILE_TYPES.split(',') : 
      ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
    
    // File naming
    naming: {
      strategy: process.env.FILE_NAMING_STRATEGY || 'uuid', // uuid, timestamp, original
      preserveExtension: process.env.PRESERVE_FILE_EXTENSION !== 'false'
    },

    // Storage configuration
    storage: {
      type: process.env.STORAGE_TYPE || 'local', // local, s3, gcs
      
      // S3 configuration
      s3: {
        bucket: process.env.S3_BUCKET,
        region: process.env.S3_REGION || 'us-east-1',
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true'
      },

      // Google Cloud Storage
      gcs: {
        bucket: process.env.GCS_BUCKET,
        projectId: process.env.GCS_PROJECT_ID,
        keyFilename: process.env.GCS_KEY_FILENAME
      }
    },

    // Image processing
    imageProcessing: {
      enabled: process.env.IMAGE_PROCESSING_ENABLED === 'true',
      quality: parseInt(process.env.IMAGE_QUALITY) || 80,
      maxWidth: parseInt(process.env.IMAGE_MAX_WIDTH) || 1920,
      maxHeight: parseInt(process.env.IMAGE_MAX_HEIGHT) || 1080,
      thumbnails: {
        enabled: process.env.THUMBNAILS_ENABLED === 'true',
        sizes: process.env.THUMBNAIL_SIZES ? 
          process.env.THUMBNAIL_SIZES.split(',').map(size => {
            const [width, height] = size.split('x');
            return { width: parseInt(width), height: parseInt(height) };
          }) : 
          [{ width: 150, height: 150 }, { width: 300, height: 300 }]
      }
    }
  },

  // Email Configuration
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    provider: process.env.EMAIL_PROVIDER || 'smtp', // smtp, sendgrid, mailgun, ses
    
    // SMTP configuration
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false'
      }
    },

    // SendGrid
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY
    },

    // Mailgun
    mailgun: {
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
    },

    // Amazon SES
    ses: {
      region: process.env.SES_REGION || 'us-east-1',
      accessKeyId: process.env.SES_ACCESS_KEY_ID,
      secretAccessKey: process.env.SES_SECRET_ACCESS_KEY
    },

    // Default settings
    defaults: {
      from: process.env.EMAIL_FROM || 'noreply@qasd.example.com',
      replyTo: process.env.EMAIL_REPLY_TO,
      subject: process.env.EMAIL_SUBJECT_PREFIX || '[QASD]'
    },

    // Templates
    templates: {
      path: process.env.EMAIL_TEMPLATES_PATH || './templates/email',
      engine: process.env.EMAIL_TEMPLATE_ENGINE || 'handlebars'
    }
  },

  // Caching Configuration
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL) || 3600, // 1 hour
    
    // Memory cache
    memory: {
      enabled: process.env.MEMORY_CACHE_ENABLED !== 'false',
      max: parseInt(process.env.MEMORY_CACHE_MAX) || 1000,
      ttl: parseInt(process.env.MEMORY_CACHE_TTL) || 600 // 10 minutes
    },

    // Redis cache
    redis: {
      enabled: process.env.REDIS_CACHE_ENABLED !== 'false',
      keyPrefix: process.env.REDIS_CACHE_PREFIX || 'cache:',
      ttl: parseInt(process.env.REDIS_CACHE_TTL) || 3600
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json', // json, simple, combined
    
    // Console logging
    console: {
      enabled: process.env.CONSOLE_LOGGING_ENABLED !== 'false',
      colorize: process.env.CONSOLE_COLORIZE !== 'false'
    },

    // File logging
    file: {
      enabled: process.env.FILE_LOGGING_ENABLED === 'true',
      path: process.env.LOG_FILE_PATH || './logs',
      filename: process.env.LOG_FILENAME || 'qasd.log',
      maxSize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
      datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD'
    },

    // External logging services
    external: {
      // Elasticsearch
      elasticsearch: {
        enabled: process.env.ELASTICSEARCH_LOGGING_ENABLED === 'true',
        host: process.env.ELASTICSEARCH_HOST || 'localhost:9200',
        index: process.env.ELASTICSEARCH_INDEX || 'qasd-logs',
        type: process.env.ELASTICSEARCH_TYPE || 'log'
      },

      // Sentry
      sentry: {
        enabled: process.env.SENTRY_ENABLED === 'true',
        dsn: process.env.SENTRY_DSN,
        environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
        release: process.env.SENTRY_RELEASE || process.env.APP_VERSION
      },

      // DataDog
      datadog: {
        enabled: process.env.DATADOG_ENABLED === 'true',
        apiKey: process.env.DATADOG_API_KEY,
        service: process.env.DATADOG_SERVICE || 'qasd',
        env: process.env.DATADOG_ENV || process.env.NODE_ENV
      }
    }
  },

  // Monitoring Configuration
  monitoring: {
    enabled: process.env.MONITORING_ENABLED !== 'false',
    
    // Health checks
    health: {
      enabled: process.env.HEALTH_CHECKS_ENABLED !== 'false',
      endpoint: process.env.HEALTH_ENDPOINT || '/health',
      interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 seconds
      timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000
    },

    // Metrics
    metrics: {
      enabled: process.env.METRICS_ENABLED !== 'false',
      endpoint: process.env.METRICS_ENDPOINT || '/metrics',
      
      // Prometheus
      prometheus: {
        enabled: process.env.PROMETHEUS_ENABLED === 'true',
        port: parseInt(process.env.PROMETHEUS_PORT) || 9090,
        prefix: process.env.PROMETHEUS_PREFIX || 'qasd_'
      }
    },

    // Performance monitoring
    performance: {
      enabled: process.env.PERFORMANCE_MONITORING_ENABLED === 'true',
      sampleRate: parseFloat(process.env.PERFORMANCE_SAMPLE_RATE) || 0.1,
      
      // APM services
      newrelic: {
        enabled: process.env.NEW_RELIC_ENABLED === 'true',
        licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
        appName: process.env.NEW_RELIC_APP_NAME || 'QASD'
      }
    }
  },

  // Backup Configuration
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
    retention: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
    compression: process.env.BACKUP_COMPRESSION || 'gzip',
    encryption: process.env.BACKUP_ENCRYPTION === 'true',
    
    // Storage locations
    destinations: {
      local: {
        enabled: process.env.LOCAL_BACKUP_ENABLED !== 'false',
        path: process.env.LOCAL_BACKUP_PATH || './backups'
      },
      
      s3: {
        enabled: process.env.S3_BACKUP_ENABLED === 'true',
        bucket: process.env.S3_BACKUP_BUCKET,
        region: process.env.S3_BACKUP_REGION,
        accessKeyId: process.env.S3_BACKUP_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_BACKUP_SECRET_ACCESS_KEY
      }
    }
  },

  // Feature Flags
  features: {
    // Document management
    documentManagement: process.env.FEATURE_DOCUMENT_MANAGEMENT !== 'false',
    advancedReporting: process.env.FEATURE_ADVANCED_REPORTING !== 'false',
    realTimeAnalytics: process.env.FEATURE_REAL_TIME_ANALYTICS !== 'false',
    
    // Mobile features
    mobileApp: process.env.FEATURE_MOBILE_APP !== 'false',
    offlineMode: process.env.FEATURE_OFFLINE_MODE !== 'false',
    pushNotifications: process.env.FEATURE_PUSH_NOTIFICATIONS === 'true',
    
    // Enterprise features
    ssoIntegration: process.env.FEATURE_SSO_INTEGRATION === 'true',
    auditTrail: process.env.FEATURE_AUDIT_TRAIL !== 'false',
    complianceReporting: process.env.FEATURE_COMPLIANCE_REPORTING !== 'false',
    
    // Experimental features
    aiAssistant: process.env.FEATURE_AI_ASSISTANT === 'true',
    voiceCommands: process.env.FEATURE_VOICE_COMMANDS === 'true',
    blockchainIntegration: process.env.FEATURE_BLOCKCHAIN === 'true'
  },

  // Localization
  i18n: {
    enabled: process.env.I18N_ENABLED !== 'false',
    defaultLocale: process.env.DEFAULT_LOCALE || 'ar',
    supportedLocales: process.env.SUPPORTED_LOCALES ? 
      process.env.SUPPORTED_LOCALES.split(',') : 
      ['ar', 'en', 'fr'],
    fallbackLocale: process.env.FALLBACK_LOCALE || 'en',
    
    // Translation services
    autoTranslate: process.env.AUTO_TRANSLATE_ENABLED === 'true',
    translationService: process.env.TRANSLATION_SERVICE || 'google', // google, azure, aws
    
    // Google Translate
    google: {
      apiKey: process.env.GOOGLE_TRANSLATE_API_KEY,
      projectId: process.env.GOOGLE_TRANSLATE_PROJECT_ID
    }
  },

  // Third-party Integrations
  integrations: {
    // Analytics
    googleAnalytics: {
      enabled: process.env.GOOGLE_ANALYTICS_ENABLED === 'true',
      trackingId: process.env.GOOGLE_ANALYTICS_TRACKING_ID
    },

    // Social media
    social: {
      facebook: {
        enabled: process.env.FACEBOOK_INTEGRATION_ENABLED === 'true',
        appId: process.env.FACEBOOK_APP_ID,
        appSecret: process.env.FACEBOOK_APP_SECRET
      },
      
      twitter: {
        enabled: process.env.TWITTER_INTEGRATION_ENABLED === 'true',
        apiKey: process.env.TWITTER_API_KEY,
        apiSecret: process.env.TWITTER_API_SECRET
      }
    },

    // Payment gateways
    payment: {
      stripe: {
        enabled: process.env.STRIPE_ENABLED === 'true',
        publicKey: process.env.STRIPE_PUBLIC_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
      },
      
      paypal: {
        enabled: process.env.PAYPAL_ENABLED === 'true',
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        sandbox: process.env.PAYPAL_SANDBOX === 'true'
      }
    }
  },

  // Development & Testing (for production debugging)
  development: {
    // Debug mode
    debug: process.env.DEBUG_MODE === 'true',
    verbose: process.env.VERBOSE_LOGGING === 'true',
    
    // Testing
    testMode: process.env.TEST_MODE === 'true',
    mockExternalServices: process.env.MOCK_EXTERNAL_SERVICES === 'true',
    
    // Performance profiling
    profiling: {
      enabled: process.env.PROFILING_ENABLED === 'true',
      sampleRate: parseFloat(process.env.PROFILING_SAMPLE_RATE) || 0.01
    }
  }
};

// Configuration validation
function validateConfiguration() {
  const config = module.exports;
  const errors = [];

  // Validate database configuration
  if (!config.database.primary.url && !config.database.primary.host) {
    errors.push('Database configuration is incomplete');
  }

  // Validate Redis configuration
  if (!config.redis.url && !config.redis.host) {
    errors.push('Redis configuration is incomplete');
  }

  // Validate JWT secret
  if (!config.auth.jwt.secret || config.auth.jwt.secret.length < 32) {
    errors.push('JWT secret must be at least 32 characters long');
  }

  // Validate encryption key
  if (!config.security.encryption.key || config.security.encryption.key.length < 32) {
    errors.push('Encryption key must be at least 32 characters long');
  }

  // Validate SSL configuration in production
  if (config.app.environment === 'production' && !config.server.ssl.enabled) {
    console.warn('⚠️  SSL is not enabled in production environment');
  }

  if (errors.length > 0) {
    console.error('❌ Configuration validation failed:');
    errors.forEach(error => console.error(`   - ${error}`));
    process.exit(1);
  }

  console.log('✅ Configuration validation passed');
}

// Run validation
validateConfiguration();

// Export configuration with environment info
module.exports.meta = {
  configuredAt: new Date().toISOString(),
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch,
  environment: process.env.NODE_ENV,
  pid: process.pid
};