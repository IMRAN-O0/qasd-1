const jwt = require('jsonwebtoken');
const { database } = require('../config/database');
const logger = require('../utils/logger');

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      logger.logSecurity('Missing authentication token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      });
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await database.get(
      'SELECT id, username, email, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      logger.logSecurity('Invalid token - user not found', {
        userId: decoded.userId,
        ip: req.ip,
        path: req.path
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (!user.is_active) {
      logger.logSecurity('Inactive user attempted access', {
        userId: user.id,
        username: user.username,
        ip: req.ip,
        path: req.path
      });
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.logSecurity('Invalid JWT token', {
        error: error.message,
        ip: req.ip,
        path: req.path
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      logger.logSecurity('Expired JWT token', {
        ip: req.ip,
        path: req.path
      });
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    logger.logError(error, req);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.logSecurity('Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
        method: req.method
      });
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Permission-based authorization middleware
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admin has all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      // Check specific permission based on role
      const rolePermissions = {
        manager: [
          'read_all', 'create_all', 'update_all', 'delete_own',
          'view_reports', 'manage_inventory', 'manage_production',
          'manage_sales', 'manage_hr', 'view_safety'
        ],
        supervisor: [
          'read_all', 'create_own', 'update_own', 'delete_own',
          'view_reports', 'manage_inventory', 'manage_production',
          'view_sales', 'view_hr', 'manage_safety'
        ],
        user: [
          'read_own', 'create_own', 'update_own',
          'view_inventory', 'view_production', 'view_sales'
        ]
      };

      const userPermissions = rolePermissions[req.user.role] || [];
      
      if (!userPermissions.includes(permission)) {
        logger.logSecurity('Permission denied', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredPermission: permission,
          path: req.path,
          method: req.method
        });
        return res.status(403).json({
          success: false,
          message: 'Permission denied'
        });
      }

      next();
    } catch (error) {
      logger.logError(error, req);
      return res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

// Optional authentication middleware (for public endpoints that benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await database.get(
        'SELECT id, username, email, role, is_active FROM users WHERE id = ? AND is_active = 1',
        [decoded.userId]
      );
      
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

// Middleware to check if user owns the resource
const checkOwnership = (resourceIdParam = 'id', userIdField = 'created_by') => {
  return async (req, res, next) => {
    try {
      // Admin can access everything
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params[resourceIdParam];
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID required'
        });
      }

      // This would need to be customized based on the specific resource
      // For now, we'll allow managers to access all resources
      if (req.user.role === 'manager') {
        return next();
      }

      next();
    } catch (error) {
      logger.logError(error, req);
      return res.status(500).json({
        success: false,
        message: 'Ownership check error'
      });
    }
  };
};

// Rate limiting per user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();
  
  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!userRequests.has(userId)) {
      userRequests.set(userId, []);
    }
    
    const requests = userRequests.get(userId);
    
    // Remove old requests
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      logger.logSecurity('Rate limit exceeded', {
        userId: req.user?.id,
        ip: req.ip,
        path: req.path,
        requestCount: validRequests.length
      });
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      });
    }
    
    validRequests.push(now);
    userRequests.set(userId, validRequests);
    
    next();
  };
};

module.exports = {
  authenticateToken,
  authorize,
  checkPermission,
  optionalAuth,
  checkOwnership,
  userRateLimit
};