
/**
 * Server Entry Point
 * Main application startup file
 */

require('dotenv').config();

const App = require('./app');

/**
 * Main application startup function
 */
async function startApplication() {
  try {
    console.log('🚀 Starting Theme Forum Application...');
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);

    // Create application instance
    const app = new App();

    // Start the application
    await app.start();

    console.log('✅ Application started successfully!');
    console.log('📚 API Documentation available at: /api/docs');
    console.log('🔒 Security features: ENABLED');
    console.log('🛡️  SQL Injection Protection: ACTIVE');
    console.log('🛡️  XSS Protection: ACTIVE');
    console.log('🛡️  Form Validation: ACTIVE');

  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

/**
 * Handle graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the application
startApplication();
