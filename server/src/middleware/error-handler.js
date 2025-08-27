/**
 * Global Error Handler Middleware
 * Handles all errors in the application
 */

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode = 'UNKNOWN_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('❌ Error occurred:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      errorCode: err.errorCode
    }
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new AppError(message, 400, 'DUPLICATE_FIELD');
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = new AppError(message, 400, 'INVALID_ID');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    let errorCode = 'FILE_UPLOAD_ERROR';

    switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      message = 'File too large';
      errorCode = 'FILE_TOO_LARGE';
      break;
    case 'LIMIT_FILE_COUNT':
      message = 'Too many files';
      errorCode = 'TOO_MANY_FILES';
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      message = 'Unexpected file field';
      errorCode = 'UNEXPECTED_FILE_FIELD';
      break;
    default:
      message = err.message;
    }

    error = new AppError(message, 400, errorCode);
  }

  // Security errors
  if (err.name === 'SecurityViolation') {
    error = new AppError(err.message, 403, 'SECURITY_VIOLATION');
  }

  // Rate limit errors
  if (err.statusCode === 429) {
    error = new AppError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
  }

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    error = new AppError('CORS policy violation', 403, 'CORS_VIOLATION');
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const errorCode = error.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = error.message || 'Internal server error';

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: message,
      ...(isDevelopment && { stack: err.stack })
    },
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown'
  };

  // Add additional context in development
  if (isDevelopment) {
    errorResponse.error.details = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.body,
      query: req.query,
      params: req.params
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
      method: req.method,
      availableRoutes: [
        'GET /health',
        'POST /api/users/register',
        'POST /api/users/login',
        'GET /api/users/profile',
        'PUT /api/users/profile',
        'POST /api/users/change-password',
        'POST /api/users/logout'
      ]
    },
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown'
  });
};

/**
 * Async error wrapper for route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Request ID middleware for tracking requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestIdMiddleware = (req, res, next) => {
  req.id = req.headers['x-request-id'] ||
        req.headers['x-correlation-id'] ||
        `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * Response time middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const responseTimeMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
};

/**
 * Error monitoring middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorMonitoringMiddleware = (req, res, next) => {
  // Monitor for suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // Script tags
    /javascript:/i, // JavaScript protocol
    /union\s+select/i, // SQL injection
    /waitfor\s+delay/i, // Time-based attacks
    /xp_cmdshell/i, // Stored procedures
    /eval\s*\(/i, // JavaScript eval
    /document\.cookie/i // Cookie access
  ];

  const requestString = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers
  });

  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(requestString)) {
      console.warn('⚠️  Suspicious pattern detected:', {
        pattern: pattern.source,
        ip: req.ip,
        path: req.path,
        timestamp: new Date().toISOString(),
        requestId: req.id
      });
    }
  });

  next();
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  requestIdMiddleware,
  responseTimeMiddleware,
  errorMonitoringMiddleware,
  AppError
};
