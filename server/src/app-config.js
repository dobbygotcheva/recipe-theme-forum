/**
 * Application Configuration
 * Centralized configuration constants and settings
 */

// Authentication cookie names
const authCookieName = 'auth-cookie';

// JWT configuration
const jwtConfig = {
  accessTokenName: `${authCookieName}_access`,
  refreshTokenName: `${authCookieName}_refresh`,
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
};

// Security configuration
const securityConfig = {
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
  accountLockoutDuration: parseInt(process.env.ACCOUNT_LOCKOUT_DURATION) || 900000, // 15 minutes
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 3600000, // 1 hour
  passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
  passwordMaxLength: parseInt(process.env.PASSWORD_MAX_LENGTH) || 128
};

// File upload configuration
const uploadConfig = {
  maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  allowedFileTypes: (process.env.UPLOAD_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(','),
  uploadDestination: process.env.UPLOAD_DESTINATION || 'uploads'
};

// Rate limiting configuration
const rateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  authMaxAttempts: parseInt(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS) || 5
};

// CORS configuration
const corsConfig = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true,
  maxAge: parseInt(process.env.CORS_MAX_AGE) || 86400
};

// Database configuration
const dbConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/theme-forum',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE) || 10,
    serverSelectionTimeoutMS: parseInt(process.env.MONGODB_CONNECTION_TIMEOUT) || 30000,
    socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT) || 30000
  }
};

// Logging configuration
const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.LOG_FORMAT || 'combined',
  file: process.env.LOG_FILE || 'logs/app.log',
  maxSize: parseInt(process.env.LOG_MAX_SIZE) || 10 * 1024 * 1024, // 10MB
  maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5
};

// Application settings
const appConfig = {
  name: process.env.APP_NAME || 'Theme Forum API',
  version: process.env.API_VERSION || 'v1',
  port: parseInt(process.env.PORT) || 3000,
  environment: process.env.NODE_ENV || 'development',
  debug: process.env.ENABLE_DEBUG_LOGGING === 'true'
};

module.exports = {
  authCookieName,
  jwtConfig,
  securityConfig,
  uploadConfig,
  rateLimitConfig,
  corsConfig,
  dbConfig,
  loggingConfig,
  appConfig
};
