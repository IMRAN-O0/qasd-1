const logger = require('../utils/logger');

// Custom error class for application errors
class AppError extends Error {
  constructor(message, statusCode, isOperational = true, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle different types of errors
const handleDatabaseError = (error) => {
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    const field = error.message.match(/UNIQUE constraint failed: \w+\.(\w+)/)?.[1] || 'field';
    return new AppError(`${field} already exists`, 400);
  }
  
  if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return new AppError('Referenced record does not exist', 400);
  }
  
  if (error.code === 'SQLITE_CONSTRAINT_NOTNULL') {
    const field = error.message.match(/NOT NULL constraint failed: \w+\.(\w+)/)?.[1] || 'field';
    return new AppError(`${field} is required`, 400);
  }
  
  return new AppError('Database operation failed', 500, false);
};

const { formatValidationErrors } = require('../utils/errorFormatter');

const handleValidationError = (error) => {
  const errors = formatValidationErrors(error.array());
  return new AppError('Validation failed', 400, true, errors);
};

const handleJWTError = () => {
  return new AppError('Invalid token, please log in again', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Token expired, please log in again', 401);
};

const handleMulterError = (error) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large', 400);
  }
  if (error.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files', 400);
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field', 400);
  }
  return new AppError('File upload error', 400);
};

// Send error response in development
const sendErrorDev = (err, req, res) => {
  // Log error details
  logger.logError(err, req);
  
  res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      status: err.status,
      errors: err.errors
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query
    }
  });
};

// Send error response in production
const sendErrorProd = (err, req, res) => {
  // Log error
  logger.logError(err, req);
  
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('Unknown error occurred:', err);
    
    res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};

// Main error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  
  // Handle specific error types
  if (err.code && err.code.startsWith('SQLITE')) {
    error = handleDatabaseError(err);
  }
  
  if (err.name === 'ValidationError' || (err.array && typeof err.array === 'function')) {
    error = handleValidationError(err);
  }
  
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }
  
  if (err.name === 'MulterError') {
    error = handleMulterError(err);
  }
  
  if (err.name === 'CastError') {
    error = new AppError('Invalid data format', 400);
  }
  
  // Send appropriate error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};







// Request timing middleware
const requestTimer = (req, res, next) => {
  req.startTime = Date.now();
  
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - req.startTime;
    
    // Log request details
    logger.logRequest(req, res, responseTime);
    
    // Log slow requests
    if (responseTime > 1000) {
      logger.logPerformance('Slow request', responseTime, {
        method: req.method,
        url: req.originalUrl,
        userId: req.user?.id
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
  notFound,
  requestTimer
};