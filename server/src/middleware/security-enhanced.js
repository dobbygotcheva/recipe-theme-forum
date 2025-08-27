const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const sqlInjectionProtection = require('../utils/sql-injection-protection');
const formValidation = require('../utils/form-validation');

// Enhanced rate limiting configuration
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100, options = {}) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000),
      ...options.message
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000),
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
    },
    skip: options.skip || ((req) => {
      // Skip rate limiting for certain conditions
      return req.path === '/health' || req.path === '/status';
    }),
    keyGenerator: options.keyGenerator || ((req) => {
      // Use IP + user agent for more granular rate limiting
      return req.ip + ':' + (req.get('User-Agent') || 'unknown');
    })
  });
};

// Specific rate limiters for different endpoints
const authRateLimiter = createRateLimiter(15 * 60 * 1000, 5, {
  message: 'Too many authentication attempts. Please try again later.',
  skip: (req) => req.path === '/health'
});

const apiRateLimiter = createRateLimiter(15 * 60 * 1000, 100, {
  message: 'API rate limit exceeded. Please reduce request frequency.'
});

const uploadRateLimiter = createRateLimiter(15 * 60 * 1000, 10, {
  message: 'Too many file uploads. Please wait before uploading more files.'
});

const searchRateLimiter = createRateLimiter(15 * 60 * 1000, 50, {
  message: 'Too many search requests. Please reduce search frequency.'
});

// Enhanced input validation middleware
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
      message: 'Please check your input and try again.',
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// SQL injection protection middleware
const sqlInjectionProtectionMiddleware = (req, res, next) => {
  try {
    // Skip security checks for GET requests with no body (they're usually safe)
    if (req.method === 'GET' && (!req.body || Object.keys(req.body).length === 0)) {
      return next();
    }

    // Check request body only if it exists and has content
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyCheck = sqlInjectionProtection.comprehensiveSecurityCheck(req.body, false); // Use non-strict mode
      if (!bodyCheck.isSafe) {
        console.warn('SQL injection attempt detected in request body:', {
          ip: req.ip,
          path: req.path,
          threats: bodyCheck.threats,
          riskLevel: bodyCheck.riskLevel
        });

        return res.status(400).json({
          error: 'Security violation detected',
          message: 'Potentially malicious input detected. Please check your input.',
          details: bodyCheck.threats,
          riskLevel: bodyCheck.riskLevel,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Check query parameters only if they exist and have content
    if (req.query && Object.keys(req.query).length > 0) {
      const queryCheck = sqlInjectionProtection.comprehensiveSecurityCheck(req.query, false); // Use non-strict mode
      if (!queryCheck.isSafe) {
        console.warn('SQL injection attempt detected in query parameters:', {
          ip: req.ip,
          path: req.path,
          threats: queryCheck.threats,
          riskLevel: queryCheck.riskLevel
        });

        return res.status(400).json({
          error: 'Security violation detected',
          message: 'Potentially malicious query parameters detected.',
          details: queryCheck.threats,
          riskLevel: queryCheck.riskLevel,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Check URL parameters only if they exist and have content
    if (req.params && Object.keys(req.params).length > 0) {
      const paramsCheck = sqlInjectionProtection.comprehensiveSecurityCheck(req.params, false); // Use non-strict mode
      if (!paramsCheck.isSafe) {
        console.warn('SQL injection attempt detected in URL parameters:', {
          ip: req.ip,
          path: req.path,
          threats: paramsCheck.threats,
          riskLevel: paramsCheck.riskLevel
        });

        return res.status(400).json({
          error: 'Security violation detected',
          message: 'Potentially malicious URL parameters detected.',
          details: paramsCheck.threats,
          riskLevel: paramsCheck.riskLevel,
          timestamp: new Date().toISOString()
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error in SQL injection protection middleware:', error);
    next();
  }
};

// XSS protection middleware
const xssProtectionMiddleware = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = formValidation.sanitizers.xss(req.body[key]);
        }
      });
    }

    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = formValidation.sanitizers.xss(req.query[key]);
        }
      });
    }

    next();
  } catch (error) {
    console.error('Error in XSS protection middleware:', error);
    next();
  }
};

// Command injection protection middleware
const commandInjectionProtectionMiddleware = (req, res, next) => {
  try {
    // Skip security checks for GET requests with no body (they're usually safe)
    if (req.method === 'GET' && (!req.body || Object.keys(req.body).length === 0)) {
      return next();
    }

    // Only check requests that actually have input data
    if (req.body && Object.keys(req.body).length > 0) {
      const input = JSON.stringify(req.body) + JSON.stringify(req.query) + JSON.stringify(req.params);
      const commandCheck = sqlInjectionProtection.detectCommandInjection(input);

      if (commandCheck.detected) {
        console.warn('Command injection attempt detected:', {
          ip: req.ip,
          path: req.path,
          patterns: commandCheck.patterns,
          riskLevel: 'HIGH'
        });

        return res.status(400).json({
          error: 'Security violation detected',
          message: 'Potentially malicious command injection attempt detected.',
          details: commandCheck.patterns,
          riskLevel: 'HIGH',
          timestamp: new Date().toISOString()
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error in command injection protection middleware:', error);
    next();
  }
};

// Input sanitization middleware
const inputSanitizationMiddleware = (req, res, next) => {
  try {
    // Sanitize all string inputs
    const sanitizeObject = (obj) => {
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          if (typeof obj[key] === 'string') {
            obj[key] = formValidation.sanitizers.comprehensive(obj[key]);
          } else if (typeof obj[key] === 'object') {
            sanitizeObject(obj[key]);
          }
        });
      }
    };

    sanitizeObject(req.body);
    sanitizeObject(req.query);
    sanitizeObject(req.params);

    next();
  } catch (error) {
    console.error('Error in input sanitization middleware:', error);
    next();
  }
};

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'https:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: process.env.CORS_MAX_AGE || 86400
};

// File upload security configuration
const fileUploadSecurity = {
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.UPLOAD_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  }
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
  });

  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err);

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'File too large',
      message: 'The uploaded file exceeds the maximum allowed size.',
      timestamp: new Date().toISOString()
    });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on our end. Please try again later.',
    timestamp: new Date().toISOString()
  });
};

// Security monitoring middleware
const securityMonitoring = (req, res, next) => {
  // Log suspicious patterns
  const suspiciousPatterns = [
    /script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload/i,
    /onerror/i,
    /eval\(/i,
    /document\./i,
    /window\./i
  ];

  const input = JSON.stringify(req.body) + JSON.stringify(req.query) + JSON.stringify(req.params);

  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(input)) {
      console.warn('Suspicious pattern detected:', {
        pattern: pattern.source,
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    }
  });

  next();
};

module.exports = {
  createRateLimiter,
  authRateLimiter,
  apiRateLimiter,
  uploadRateLimiter,
  searchRateLimiter,
  validateInput,
  sqlInjectionProtectionMiddleware,
  xssProtectionMiddleware,
  commandInjectionProtectionMiddleware,
  inputSanitizationMiddleware,
  securityHeaders,
  corsOptions,
  fileUploadSecurity,
  requestLogger,
  errorHandler,
  securityMonitoring
};
