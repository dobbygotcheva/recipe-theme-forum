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
    skip: options.skip || (req) => {
      // Skip rate limiting for certain conditions
      return req.path === '/health' || req.path === '/status';
    },
    keyGenerator: options.keyGenerator || (req) => {
      // Use IP + user agent for more granular rate limiting
      return req.ip + ':' + (req.get('User-Agent') || 'unknown');
    }
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
    // Check request body
    if (req.body) {
      const bodyCheck = sqlInjectionProtection.comprehensiveSecurityCheck(req.body, true);
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

    // Check query parameters
    if (req.query) {
      const queryCheck = sqlInjectionProtection.comprehensiveSecurityCheck(req.query, true);
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

    // Check URL parameters
    if (req.params) {
      const paramsCheck = sqlInjectionProtection.comprehensiveSecurityCheck(req.params, true);
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
    console.error('SQL injection protection error:', error);
    return res.status(500).json({
      error: 'Security check error',
      message: 'An error occurred during security validation.'
    });
  }
};

// XSS protection middleware
const xssProtectionMiddleware = (req, res, next) => {
  try {
    // Check for XSS patterns in all input
    const inputs = {
      body: req.body,
      query: req.query,
      params: req.params
    };

    Object.entries(inputs).forEach(([type, data]) => {
      if (data) {
        const xssCheck = sqlInjectionProtection.detectXss(data);
        if (!xssCheck.isSafe) {
          console.warn('XSS attempt detected:', {
            ip: req.ip,
            path: req.path,
            type,
            threats: xssCheck.threats,
            riskLevel: xssCheck.riskLevel
          });
          
          return res.status(400).json({
            error: 'XSS protection violation',
            message: 'Potentially malicious script content detected.',
            details: xssCheck.threats,
            riskLevel: xssCheck.riskLevel,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    next();
  } catch (error) {
    console.error('XSS protection error:', error);
    return res.status(500).json({
      error: 'XSS check error',
      message: 'An error occurred during XSS validation.'
    });
  }
};

// Command injection protection middleware
const commandInjectionProtectionMiddleware = (req, res, next) => {
  try {
    // Check for command injection patterns
    const inputs = {
      body: req.body,
      query: req.query,
      params: req.params
    };

    Object.entries(inputs).forEach(([type, data]) => {
      if (data) {
        const commandCheck = sqlInjectionProtection.detectCommandInjection(data);
        if (!commandCheck.isSafe) {
          console.warn('Command injection attempt detected:', {
            ip: req.ip,
            path: req.path,
            type,
            threats: commandCheck.threats,
            riskLevel: commandCheck.riskLevel
          });
          
          return res.status(400).json({
            error: 'Command injection protection violation',
            message: 'Potentially malicious command content detected.',
            details: commandCheck.threats,
            riskLevel: commandCheck.riskLevel,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    next();
  } catch (error) {
    console.error('Command injection protection error:', error);
    return res.status(500).json({
      error: 'Command injection check error',
      message: 'An error occurred during command injection validation.'
    });
  }
};

// Input sanitization middleware
const inputSanitizationMiddleware = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sqlInjectionProtection.sanitizeInput(req.body[key], {
            removeHtml: true,
            removeSql: true,
            removeCommands: true,
            maxLength: 1000
          });
        }
      });
    }

    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sqlInjectionProtection.sanitizeInput(req.query[key], {
            removeHtml: true,
            removeSql: true,
            removeCommands: true,
            maxLength: 500
          });
        }
      });
    }

    // Sanitize URL parameters
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = sqlInjectionProtection.sanitizeInput(req.params[key], {
            removeHtml: true,
            removeSql: true,
            removeCommands: true,
            maxLength: 200
          });
        }
      });
    }

    next();
  } catch (error) {
    console.error('Input sanitization error:', error);
    return res.status(500).json({
      error: 'Input sanitization error',
      message: 'An error occurred during input sanitization.'
    });
  }
};

// Enhanced security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:3000"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  ieNoOpen: true,
  noCache: true
});

// Enhanced CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:4200',
      'http://localhost:3000'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('CORS violation attempt:', { origin, timestamp: new Date().toISOString() });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
  exposedHeaders: ['Set-Cookie', 'X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Enhanced file upload security
const fileUploadSecurity = {
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      // Additional security checks
      const filenameCheck = sqlInjectionProtection.detectCommandInjection(file.originalname);
      if (!filenameCheck.isSafe) {
        console.warn('Malicious filename detected:', {
          ip: req.ip,
          filename: file.originalname,
          threats: filenameCheck.threats
        });
        return cb(new Error('Malicious filename detected'));
      }
      
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 1,
    fieldSize: 1024 * 1024 // 1MB for text fields
  }
};

// Request logging middleware with security events
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const securityEvents = [];
  
  // Log security-relevant information
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    securityEvents
  };
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logData.duration = duration;
    logData.statusCode = res.statusCode;
    
    // Log security events
    if (securityEvents.length > 0) {
      console.warn('Security events detected:', logData);
    } else {
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    }
  });
  
  next();
};

// Enhanced error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Security-related errors
  if (err.name === 'SecurityViolation') {
    return res.status(403).json({
      error: 'Security Violation',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
  
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File Upload Error',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      timestamp: new Date().toISOString()
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      timestamp: new Date().toISOString()
    });
  }
  
  // Default error
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString()
  });
};

// Security monitoring middleware
const securityMonitoring = (req, res, next) => {
  // Track suspicious patterns
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
      console.warn('Suspicious pattern detected:', {
        pattern: pattern.source,
        ip: req.ip,
        path: req.path,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  next();
};

// Export all middleware functions
module.exports = {
  // Rate limiting
  createRateLimiter,
  authRateLimiter,
  apiRateLimiter,
  uploadRateLimiter,
  searchRateLimiter,
  
  // Validation
  validateInput,
  
  // Security protection
  sqlInjectionProtectionMiddleware,
  xssProtectionMiddleware,
  commandInjectionProtectionMiddleware,
  inputSanitizationMiddleware,
  
  // Headers and CORS
  securityHeaders,
  corsOptions,
  
  // File upload
  fileUploadSecurity,
  
  // Logging and monitoring
  requestLogger,
  securityMonitoring,
  
  // Error handling
  errorHandler
};
