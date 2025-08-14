const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
require('dotenv').config();
const db = require('./db');

const { initializeDatabase } = require('./src/config/database');
const logger = require('./src/utils/logger');
const socketManager = require('./src/utils/socket');
const backupManager = require('./src/utils/backup');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');
const { authenticateToken } = require('./src/middleware/auth');
const authRequired = require('./middleware/authRequired');

// Import routes
const authRoutes = require('./src/routes/auth');
const salesRoutes = require('./src/routes/sales');
const inventoryRoutes = require('./src/routes/inventory');
const productionRoutes = require('./src/routes/production');
const hrRoutes = require('./src/routes/hr');
const safetyRoutes = require('./src/routes/safety');
const reportsRoutes = require('./src/routes/reports');
const settingsRoutes = require('./src/routes/settings');
const uploadsRoutes = require('./src/routes/uploads');

const app = express();
// Create HTTP server
const server = createServer(app);

server.on('error', (error) => {
  logger.error(`Server error: ${error.message}`, { stack: error.stack });
  process.exit(1);
});

// Initialize Socket.IO
const io = socketManager.initialize(server);

const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet());
// Flexible CORS for development + strict in production
const allowedOriginsEnv = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = allowedOriginsEnv.split(',').map(s => s.trim());
app.use(cors({
  origin: function(origin, callback) {
    // Allow non-browser requests or same-origin
    if (!origin) return callback(null, true);
    // Allow explicit origins from env
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In development, allow common local dev hosts and LAN IPs on port 5173
    const isDev = (process.env.NODE_ENV || 'development') !== 'production';
    if (isDev) {
      const devPattern = /^http:\/\/(localhost|127\.0\.0\.1|10\.(\d{1,3}\.){2}\d{1,3}|192\.168\.(\d{1,3})\.(\d{1,3})|172\.(1[6-9]|2\d|3[0-1])\.(\d{1,3})\.(\d{1,3})):5173$/;
      if (devPattern.test(origin)) return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true
}));
app.use(limiter);
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => res.json({ ok: true, service: 'qasd-backend' }));

// Health check endpoint with database check
app.get('/api/health', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    res.json({ ok: true, db: 'up' });
  } catch (e) {
    res.status(500).json({ ok: false, db: 'down', error: String(e.message || e) });
  }
});

// Legacy health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Body parsing middleware
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', authenticateToken, reportsRoutes);
app.use('/api/inventory', authenticateToken, inventoryRoutes);
app.use('/api/production', authenticateToken, productionRoutes);
app.use('/api/sales', authenticateToken, salesRoutes);
app.use('/api/hr', authenticateToken, hrRoutes);
app.use('/api/safety', authenticateToken, safetyRoutes);
app.use('/api/settings', authenticateToken, settingsRoutes);
app.use('/api/uploads', authenticateToken, uploadsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use(errorHandler);

// Make io available globally
app.set('io', io);

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    logger.info('Database initialized successfully');
    
    // Start backup scheduler
    backupManager.startScheduledBackups();
    logger.info('Backup scheduler started');
    
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Only start server if this file is run directly (not during tests)
if (require.main === module) {
  startServer();
}

module.exports = { app, io };