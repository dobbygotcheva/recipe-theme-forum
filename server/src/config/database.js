const mongoose = require('mongoose');

/**
 * Database Configuration
 * Handles MongoDB connection and configuration
 */
class DatabaseConfig {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  /**
     * Connect to MongoDB
     * @returns {Promise<mongoose.Connection>}
     */
  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/theme-forum';

      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        autoIndex: process.env.NODE_ENV !== 'production',
        retryWrites: true,
        w: 'majority'
      };

      this.connection = await mongoose.connect(mongoUri, options);
      this.isConnected = true;

      console.log('✅ MongoDB connected successfully');

      // Handle connection events
      this.connection.connection.on('error', this.handleError.bind(this));
      this.connection.connection.on('disconnected', this.handleDisconnect.bind(this));
      this.connection.connection.on('reconnected', this.handleReconnect.bind(this));

      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  /**
     * Disconnect from MongoDB
     * @returns {Promise<void>}
     */
  async disconnect() {
    try {
      if (this.connection && this.isConnected) {
        await mongoose.disconnect();
        this.isConnected = false;
        console.log('✅ MongoDB disconnected successfully');
      }
    } catch (error) {
      console.error('❌ MongoDB disconnection failed:', error);
      throw error;
    }
  }

  /**
     * Get connection status
     * @returns {boolean}
     */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
     * Get connection instance
     * @returns {mongoose.Connection|null}
     */
  getConnection() {
    return this.connection;
  }

  /**
     * Handle connection errors
     * @param {Error} error
     */
  handleError(error) {
    console.error('❌ MongoDB connection error:', error);
    this.isConnected = false;
  }

  /**
     * Handle disconnection
     */
  handleDisconnect() {
    console.log('⚠️  MongoDB disconnected');
    this.isConnected = false;
  }

  /**
     * Handle reconnection
     */
  handleReconnect() {
    console.log('✅ MongoDB reconnected');
    this.isConnected = true;
  }

  /**
     * Health check
     * @returns {Object}
     */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return {
          status: 'disconnected',
          message: 'Database is not connected',
          timestamp: new Date().toISOString()
        };
      }

      // Ping the database
      await mongoose.connection.db.admin().ping();

      return {
        status: 'connected',
        message: 'Database is healthy',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.db.databaseName,
        collections: await mongoose.connection.db.listCollections().toArray()
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Database health check failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const databaseConfig = new DatabaseConfig();

module.exports = databaseConfig;
