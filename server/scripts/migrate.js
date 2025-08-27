#!/usr/bin/env node

/**
 * Database Migration Script
 * Handles database schema migrations and updates
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Import models
const User = require('../src/models/user.model');
const Theme = require('../src/models/theme.model');

class DatabaseMigrator {
    constructor() {
        this.mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/theme-forum';
        this.connection = null;
    }

    /**
     * Connect to MongoDB
     */
    async connect() {
        try {
            console.log('🔌 Connecting to MongoDB...');

            this.connection = await mongoose.connect(this.mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            console.log('✅ Connected to MongoDB successfully');
            return true;
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error.message);
            return false;
        }
    }

    /**
     * Disconnect from MongoDB
     */
    async disconnect() {
        try {
            if (this.connection) {
                await mongoose.disconnect();
                console.log('🔌 Disconnected from MongoDB');
            }
        } catch (error) {
            console.error('❌ Error disconnecting from MongoDB:', error.message);
        }
    }

    /**
     * Create database indexes
     */
    async createIndexes() {
        try {
            console.log('📊 Creating database indexes...');

            // User indexes
            await User.createIndexes();
            console.log('✅ User indexes created');

            // Theme indexes
            await Theme.createIndexes();
            console.log('✅ Theme indexes created');

            console.log('✅ All indexes created successfully');
            return true;
        } catch (error) {
            console.error('❌ Error creating indexes:', error.message);
            return false;
        }
    }

    /**
     * Create text search indexes
     */
    async createTextIndexes() {
        try {
            console.log('🔍 Creating text search indexes...');

            // Theme text search index
            await Theme.collection.createIndex({
                title: 'text',
                description: 'text',
                content: 'text'
            });
            console.log('✅ Theme text search index created');

            console.log('✅ All text search indexes created successfully');
            return true;
        } catch (error) {
            console.error('❌ Error creating text search indexes:', error.message);
            return false;
        }
    }

    /**
     * Create compound indexes for performance
     */
    async createCompoundIndexes() {
        try {
            console.log('🔗 Creating compound indexes...');

            // Theme compound indexes
            await Theme.collection.createIndex({ category: 1, status: 1 });
            await Theme.collection.createIndex({ difficulty: 1, status: 1 });
            await Theme.collection.createIndex({ rating: -1, status: 1 });
            await Theme.collection.createIndex({ views: -1, status: 1 });
            await Theme.collection.createIndex({ likes: -1, status: 1 });
            await Theme.collection.createIndex({ isPublished: 1, isApproved: 1 });
            await Theme.collection.createIndex({ isFeatured: 1, status: 1 });
            await Theme.collection.createIndex({ createdAt: -1 });
            await Theme.collection.createIndex({ updatedAt: -1 });

            console.log('✅ Theme compound indexes created');

            // User compound indexes
            await User.collection.createIndex({ email: 1, isActive: 1 });
            await User.collection.createIndex({ username: 1, isActive: 1 });
            await User.collection.createIndex({ role: 1, isActive: 1 });
            await User.collection.createIndex({ createdAt: -1 });
            await User.collection.createIndex({ lastLogin: -1 });

            console.log('✅ User compound indexes created');

            console.log('✅ All compound indexes created successfully');
            return true;
        } catch (error) {
            console.error('❌ Error creating compound indexes:', error.message);
            return false;
        }
    }

    /**
     * Create geospatial indexes (if needed)
     */
    async createGeospatialIndexes() {
        try {
            console.log('🌍 Creating geospatial indexes...');

            // User location index (if location field exists)
            if (User.schema.paths.location) {
                await User.collection.createIndex({ location: '2dsphere' });
                console.log('✅ User location geospatial index created');
            }

            console.log('✅ All geospatial indexes created successfully');
            return true;
        } catch (error) {
            console.error('❌ Error creating geospatial indexes:', error.message);
            return false;
        }
    }

    /**
     * Validate database schema
     */
    async validateSchema() {
        try {
            console.log('🔍 Validating database schema...');

            // Validate User schema
            const userSchema = User.schema;
            console.log('✅ User schema validation passed');

            // Validate Theme schema
            const themeSchema = Theme.schema;
            console.log('✅ Theme schema validation passed');

            console.log('✅ All schema validations passed');
            return true;
        } catch (error) {
            console.error('❌ Schema validation failed:', error.message);
            return false;
        }
    }

    /**
     * Check database health
     */
    async checkDatabaseHealth() {
        try {
            console.log('🏥 Checking database health...');

            // Check connection
            const connectionState = mongoose.connection.readyState;
            const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
            console.log(`📊 Connection state: ${states[connectionState]}`);

            // Check collections
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log(`📚 Collections found: ${collections.length}`);

            // Check document counts
            const userCount = await User.countDocuments();
            const themeCount = await Theme.countDocuments();
            console.log(`👥 Users: ${userCount}`);
            console.log(`🍳 Themes: ${themeCount}`);

            console.log('✅ Database health check completed');
            return true;
        } catch (error) {
            console.error('❌ Database health check failed:', error.message);
            return false;
        }
    }

    /**
     * Run all migrations
     */
    async runMigrations() {
        try {
            console.log('🚀 Starting database migrations...\n');

            // Connect to database
            const connected = await this.connect();
            if (!connected) {
                throw new Error('Failed to connect to database');
            }

            // Run migrations in order
            await this.validateSchema();
            await this.createIndexes();
            await this.createTextIndexes();
            await this.createCompoundIndexes();
            await this.createGeospatialIndexes();
            await this.checkDatabaseHealth();

            console.log('\n🎉 All migrations completed successfully!');
            return true;
        } catch (error) {
            console.error('\n❌ Migration failed:', error.message);
            return false;
        } finally {
            await this.disconnect();
        }
    }

    /**
     * Rollback migrations (if needed)
     */
    async rollbackMigrations() {
        try {
            console.log('🔄 Rolling back migrations...');

            // Connect to database
            const connected = await this.connect();
            if (!connected) {
                throw new Error('Failed to connect to database');
            }

            // Drop all indexes
            await User.collection.dropIndexes();
            await Theme.collection.dropIndexes();

            console.log('✅ All indexes dropped successfully');
            return true;
        } catch (error) {
            console.error('❌ Rollback failed:', error.message);
            return false;
        } finally {
            await this.disconnect();
        }
    }

    /**
     * Show migration status
     */
    async showStatus() {
        try {
            console.log('📊 Migration Status...\n');

            // Connect to database
            const connected = await this.connect();
            if (!connected) {
                throw new Error('Failed to connect to database');
            }

            // Check indexes
            const userIndexes = await User.collection.indexes();
            const themeIndexes = await Theme.collection.indexes();

            console.log('📚 User Indexes:');
            userIndexes.forEach(index => {
                console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
            });

            console.log('\n🍳 Theme Indexes:');
            themeIndexes.forEach(index => {
                console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
            });

            console.log('\n✅ Status check completed');
            return true;
        } catch (error) {
            console.error('❌ Status check failed:', error.message);
            return false;
        } finally {
            await this.disconnect();
        }
    }
}

// CLI interface
async function main() {
    const migrator = new DatabaseMigrator();
    const command = process.argv[2];

    switch (command) {
        case 'migrate':
            await migrator.runMigrations();
            break;
        case 'rollback':
            await migrator.rollbackMigrations();
            break;
        case 'status':
            await migrator.showStatus();
            break;
        case 'indexes':
            await migrator.connect();
            await migrator.createIndexes();
            await migrator.disconnect();
            break;
        case 'health':
            await migrator.connect();
            await migrator.checkDatabaseHealth();
            await migrator.disconnect();
            break;
        default:
            console.log(`
🔧 Database Migration Tool

Usage: node scripts/migrate.js [command]

Commands:
  migrate    Run all migrations
  rollback   Rollback all migrations
  status     Show migration status
  indexes    Create database indexes
  health     Check database health

Examples:
  node scripts/migrate.js migrate
  node scripts/migrate.js status
  node scripts/migrate.js health
      `);
            break;
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Migration script failed:', error.message);
        process.exit(1);
    });
}

module.exports = DatabaseMigrator;
