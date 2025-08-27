#!/usr/bin/env node

/**
 * Database Seeding Script
 * Populates the database with initial data for development and testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import models
const User = require('../src/models/user.model');
const Theme = require('../src/models/theme.model');

class DatabaseSeeder {
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
     * Clear existing data
     */
    async clearData() {
        try {
            console.log('🧹 Clearing existing data...');

            await User.deleteMany({});
            await Theme.deleteMany({});

            console.log('✅ Existing data cleared');
            return true;
        } catch (error) {
            console.error('❌ Error clearing data:', error.message);
            return false;
        }
    }

    /**
     * Create admin user
     */
    async createAdminUser() {
        try {
            console.log('👑 Creating admin user...');

            const adminPassword = await bcrypt.hash('AdminPassword123!', 12);

            const adminUser = new User({
                username: 'admin',
                email: 'admin@themeforum.com',
                password: adminPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                isActive: true,
                emailVerified: true,
                bio: 'System administrator for Theme Forum',
                location: 'System',
                website: 'https://themeforum.com'
            });

            await adminUser.save();
            console.log('✅ Admin user created:', adminUser.username);

            return adminUser;
        } catch (error) {
            console.error('❌ Error creating admin user:', error.message);
            return null;
        }
    }

    /**
     * Create regular users
     */
    async createRegularUsers() {
        try {
            console.log('👥 Creating regular users...');

            const users = [];
            const userData = [
                {
                    username: 'chef_john',
                    email: 'john@themeforum.com',
                    password: 'ChefPassword123!',
                    firstName: 'John',
                    lastName: 'Chef',
                    bio: 'Professional chef with 15 years of experience',
                    location: 'New York, NY',
                    website: 'https://chefjohn.com'
                },
                {
                    username: 'baking_betty',
                    email: 'betty@themeforum.com',
                    password: 'BakingPassword123!',
                    firstName: 'Betty',
                    lastName: 'Baker',
                    bio: 'Passionate baker and pastry chef',
                    location: 'Los Angeles, CA',
                    website: 'https://bakingbetty.com'
                },
                {
                    username: 'vegan_victor',
                    email: 'victor@themeforum.com',
                    password: 'VeganPassword123!',
                    firstName: 'Victor',
                    lastName: 'Green',
                    bio: 'Plant-based cooking enthusiast',
                    location: 'Portland, OR',
                    website: 'https://veganvictor.com'
                }
            ];

            for (const userInfo of userData) {
                const hashedPassword = await bcrypt.hash(userInfo.password, 12);

                const user = new User({
                    ...userInfo,
                    password: hashedPassword,
                    role: 'user',
                    isActive: true,
                    emailVerified: true
                });

                await user.save();
                users.push(user);
                console.log('✅ User created:', user.username);
            }

            return users;
        } catch (error) {
            console.error('❌ Error creating regular users:', error.message);
            return [];
        }
    }

    /**
     * Create sample themes
     */
    async createSampleThemes(users) {
        try {
            console.log('🍳 Creating sample themes...');

            const themes = [];
            const themeData = [
                {
                    title: 'Classic Margherita Pizza',
                    description: 'A traditional Italian pizza with fresh mozzarella, basil, and tomato sauce',
                    content: 'This authentic Margherita pizza recipe brings the taste of Naples to your kitchen. The key is using high-quality ingredients and a hot oven for the perfect crispy crust.',
                    category: 'dinner',
                    difficulty: 'medium',
                    prepTime: 45,
                    cookTime: 15,
                    servings: 4,
                    ingredients: [
                        { name: 'Pizza dough', amount: 1, unit: 'ball', notes: 'Store-bought or homemade' },
                        { name: 'Fresh mozzarella', amount: 8, unit: 'oz', notes: 'Buffalo mozzarella preferred' },
                        { name: 'Fresh basil leaves', amount: 10, unit: 'leaves', notes: 'Fresh from garden if possible' },
                        { name: 'San Marzano tomatoes', amount: 14, unit: 'oz', notes: 'Canned whole tomatoes' },
                        { name: 'Extra virgin olive oil', amount: 2, unit: 'tbsp', notes: 'High quality Italian oil' }
                    ],
                    instructions: [
                        { step: 1, description: 'Preheat oven to 500°F (260°C) with pizza stone inside', time: 5 },
                        { step: 2, description: 'Stretch pizza dough to 12-inch circle on floured surface', time: 10 },
                        { step: 3, description: 'Spread tomato sauce evenly over dough', time: 2 },
                        { step: 4, description: 'Add torn mozzarella pieces and basil leaves', time: 3 },
                        { step: 5, description: 'Drizzle with olive oil and bake for 12-15 minutes', time: 15 }
                    ],
                    cuisine: 'Italian',
                    season: 'all-year',
                    dietary: ['vegetarian'],
                    tags: ['pizza', 'Italian', 'traditional', 'mozzarella', 'basil']
                },
                {
                    title: 'Chocolate Chip Cookies',
                    description: 'Soft and chewy chocolate chip cookies with crispy edges',
                    content: 'These classic chocolate chip cookies are perfect for any occasion. The secret is in the brown sugar and vanilla extract that gives them that irresistible flavor.',
                    category: 'dessert',
                    difficulty: 'easy',
                    prepTime: 20,
                    cookTime: 12,
                    servings: 24,
                    ingredients: [
                        { name: 'All-purpose flour', amount: 2.25, unit: 'cups', notes: 'Sifted' },
                        { name: 'Butter', amount: 1, unit: 'cup', notes: 'Softened, unsalted' },
                        { name: 'Brown sugar', amount: 0.75, unit: 'cup', notes: 'Packed' },
                        { name: 'Granulated sugar', amount: 0.75, unit: 'cup', notes: 'White sugar' },
                        { name: 'Chocolate chips', amount: 2, unit: 'cups', notes: 'Semi-sweet' }
                    ],
                    instructions: [
                        { step: 1, description: 'Preheat oven to 375°F (190°C)', time: 5 },
                        { step: 2, description: 'Cream butter and sugars until light and fluffy', time: 5 },
                        { step: 3, description: 'Add eggs and vanilla, mix well', time: 3 },
                        { step: 4, description: 'Gradually add flour mixture, then chocolate chips', time: 5 },
                        { step: 5, description: 'Drop rounded tablespoons onto baking sheet and bake', time: 12 }
                    ],
                    cuisine: 'American',
                    season: 'all-year',
                    dietary: ['vegetarian'],
                    tags: ['cookies', 'chocolate', 'dessert', 'baking', 'classic']
                },
                {
                    title: 'Quinoa Buddha Bowl',
                    description: 'Healthy and colorful quinoa bowl with roasted vegetables and tahini dressing',
                    content: 'This nutritious Buddha bowl is packed with protein, fiber, and vitamins. The combination of quinoa, roasted vegetables, and creamy tahini dressing makes it both healthy and delicious.',
                    category: 'lunch',
                    difficulty: 'easy',
                    prepTime: 25,
                    cookTime: 30,
                    servings: 2,
                    ingredients: [
                        { name: 'Quinoa', amount: 1, unit: 'cup', notes: 'Rinsed' },
                        { name: 'Sweet potato', amount: 1, unit: 'medium', notes: 'Cubed' },
                        { name: 'Chickpeas', amount: 1, unit: 'can', notes: 'Drained and rinsed' },
                        { name: 'Kale', amount: 2, unit: 'cups', notes: 'Chopped' },
                        { name: 'Tahini', amount: 2, unit: 'tbsp', notes: 'For dressing' }
                    ],
                    instructions: [
                        { step: 1, description: 'Cook quinoa according to package instructions', time: 20 },
                        { step: 2, description: 'Roast sweet potato and chickpeas at 400°F (200°C)', time: 25 },
                        { step: 3, description: 'Massage kale with olive oil and lemon juice', time: 5 },
                        { step: 4, description: 'Make tahini dressing with lemon, garlic, and water', time: 5 },
                        { step: 5, description: 'Assemble bowls with quinoa, vegetables, and dressing', time: 5 }
                    ],
                    cuisine: 'Mediterranean',
                    season: 'all-year',
                    dietary: ['vegetarian', 'vegan', 'gluten-free'],
                    tags: ['healthy', 'quinoa', 'vegetables', 'bowl', 'mediterranean']
                }
            ];

            for (let i = 0; i < themeData.length; i++) {
                const themeInfo = themeData[i];
                const author = users[i % users.length]; // Distribute themes among users

                const theme = new Theme({
                    ...themeInfo,
                    author: author._id,
                    isPublished: true,
                    isApproved: true,
                    status: 'published',
                    rating: {
                        average: Math.random() * 2 + 3, // Random rating between 3-5
                        count: Math.floor(Math.random() * 20) + 5 // Random count between 5-25
                    },
                    views: Math.floor(Math.random() * 1000) + 100, // Random views between 100-1100
                    likes: Math.floor(Math.random() * 100) + 10 // Random likes between 10-110
                });

                await theme.save();
                themes.push(theme);
                console.log('✅ Theme created:', theme.title);
            }

            return themes;
        } catch (error) {
            console.error('❌ Error creating sample themes:', error.message);
            return [];
        }
    }

    /**
     * Create sample data
     */
    async createSampleData() {
        try {
            console.log('🌱 Starting database seeding...\n');

            // Connect to database
            const connected = await this.connect();
            if (!connected) {
                throw new Error('Failed to connect to database');
            }

            // Clear existing data
            await this.clearData();

            // Create users
            const adminUser = await this.createAdminUser();
            const regularUsers = await this.createRegularUsers();
            const allUsers = [adminUser, ...regularUsers];

            // Create themes
            const themes = await this.createSampleThemes(regularUsers);

            console.log('\n📊 Seeding Summary:');
            console.log(`👥 Users created: ${allUsers.length}`);
            console.log(`🍳 Themes created: ${themes.length}`);
            console.log(`👑 Admin user: ${adminUser ? adminUser.username : 'Failed'}`);
            console.log(`👤 Regular users: ${regularUsers.length}`);

            console.log('\n🎉 Database seeding completed successfully!');
            return true;
        } catch (error) {
            console.error('\n❌ Seeding failed:', error.message);
            return false;
        } finally {
            await this.disconnect();
        }
    }

    /**
     * Show seeding status
     */
    async showStatus() {
        try {
            console.log('📊 Database Seeding Status...\n');

            // Connect to database
            const connected = await this.connect();
            if (!connected) {
                throw new Error('Failed to connect to database');
            }

            // Check document counts
            const userCount = await User.countDocuments();
            const themeCount = await Theme.countDocuments();

            console.log('📚 Current Data:');
            console.log(`👥 Users: ${userCount}`);
            console.log(`🍳 Themes: ${themeCount}`);

            if (userCount > 0) {
                const users = await User.find().select('username role isActive');
                console.log('\n👥 User Details:');
                users.forEach(user => {
                    console.log(`  - ${user.username} (${user.role}) - ${user.isActive ? 'Active' : 'Inactive'}`);
                });
            }

            if (themeCount > 0) {
                const themes = await Theme.find().select('title status isPublished isApproved');
                console.log('\n🍳 Theme Details:');
                themes.forEach(theme => {
                    console.log(`  - ${theme.title} - ${theme.status} (Published: ${theme.isPublished}, Approved: ${theme.isApproved})`);
                });
            }

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
    const seeder = new DatabaseSeeder();
    const command = process.argv[2];

    switch (command) {
        case 'seed':
            await seeder.createSampleData();
            break;
        case 'clear':
            await seeder.connect();
            await seeder.clearData();
            await seeder.disconnect();
            break;
        case 'status':
            await seeder.showStatus();
            break;
        case 'users':
            await seeder.connect();
            await seeder.createAdminUser();
            await seeder.createRegularUsers();
            await seeder.disconnect();
            break;
        case 'themes':
            await seeder.connect();
            const users = await User.find();
            await seeder.createSampleThemes(users);
            await seeder.disconnect();
            break;
        default:
            console.log(`
🌱 Database Seeding Tool

Usage: node scripts/seed.js [command]

Commands:
  seed      Seed database with sample data
  clear     Clear all data from database
  status    Show current database status
  users     Create only users
  themes    Create only themes

Examples:
  node scripts/seed.js seed
  node scripts/seed.js status
  node scripts/seed.js clear
      `);
            break;
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Seeding script failed:', error.message);
        process.exit(1);
    });
}

module.exports = DatabaseSeeder;
