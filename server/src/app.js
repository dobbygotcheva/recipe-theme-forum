const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');

// Import middleware
const securityMiddleware = require('./middleware/security-enhanced');
const errorHandlerModule = require('./middleware/error-handler');

// Debug logging
console.log('🔍 Debug: errorHandlerModule:', errorHandlerModule);
console.log('🔍 Debug: errorHandler function:', errorHandlerModule.errorHandler);

// Import routes
const userRoutes = require('./routes/user.routes');
const themeRoutes = require('./routes/theme.routes');
const commentRoutes = require('./routes/comment.routes');
const ratingRoutes = require('./routes/rating.routes');

// Import configuration
const databaseConfig = require('./config/database');

/**
 * Express Application
 * Main application setup and configuration
 */
class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.environment = process.env.NODE_ENV || 'development';

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
     * Initialize all middleware
     */
  initializeMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", 'http://localhost:3000'],
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
    }));

    // CORS configuration
    this.app.use(cors({
      origin: (origin, callback) => {
        const allowedOrigins = [
          process.env.CORS_ORIGIN || 'http://localhost:4200',
          'http://localhost:3000'
        ];

        if (!origin) {return callback(null, true);}

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
      maxAge: 86400,
      preflightContinue: false,
      optionsSuccessStatus: 204
    }));

    // Rate limiting
    this.app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 900
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP, please try again later.',
            retryAfter: 900
          },
          timestamp: new Date().toISOString()
        });
      }
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Cookie parser
    this.app.use(cookieParser());

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    if (this.environment === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Security middleware
    this.app.use(securityMiddleware.sqlInjectionProtectionMiddleware);
    this.app.use(securityMiddleware.xssProtectionMiddleware);
    this.app.use(securityMiddleware.commandInjectionProtectionMiddleware);
    this.app.use(securityMiddleware.inputSanitizationMiddleware);
    this.app.use(securityMiddleware.securityMonitoring);

    // Trust proxy (for rate limiting behind reverse proxy)
    this.app.set('trust proxy', 1);
  }

  /**
     * Initialize all routes
     */
  initializeRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        data: {
          service: 'Theme Forum API',
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: this.environment,
          version: process.env.npm_package_version || '1.0.0'
        }
      });
    });

    // API routes
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/themes', themeRoutes);
    this.app.use('/api/comments', commentRoutes);
    this.app.use('/api/ratings', ratingRoutes);

    // 404 handler for undefined routes
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'ROUTE_NOT_FOUND',
          message: `Route ${req.originalUrl} not found`,
          method: req.method
        },
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
     * Initialize error handling
     */
  initializeErrorHandling() {
    // Global error handler
    this.app.use(errorHandlerModule.errorHandler);
  }

  /**
     * Connect to database
     */
  async connectDatabase() {
    try {
      await databaseConfig.connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  /**
     * Start the application
     */
  async start() {
    try {
      // Connect to database
      await this.connectDatabase();

      // Start server
      this.server = this.app.listen(this.port, () => {
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`🌍 Environment: ${this.environment}`);
        console.log(`📊 Health check: http://localhost:${this.port}/health`);
        console.log('🔒 Security features: Enabled');
        console.log('📝 API Documentation: Available');
      });

      // Graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      console.error('❌ Failed to start application:', error);
      process.exit(1);
    }
  }

  /**
     * Setup graceful shutdown
     */
  setupGracefulShutdown() {
    const gracefulShutdown = async(signal) => {
      console.log(`\n⚠️  Received ${signal}. Starting graceful shutdown...`);

      try {
        // Close server
        if (this.server) {
          this.server.close(() => {
            console.log('✅ HTTP server closed');
          });
        }

        // Close database connection
        await databaseConfig.disconnect();
        console.log('✅ Database connection closed');

        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  }

  /**
     * Get Express app instance
     */
  getApp() {
    return this.app;
  }

  /**
     * Get server instance
     */
  getServer() {
    return this.server;
  }
}

module.exports = App;
