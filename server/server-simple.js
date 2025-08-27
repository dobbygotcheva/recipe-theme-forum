const express = require('express');
const cors = require('cors');
const path = require('path');

// Import the simple database
const db = require('./config/db-simple');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:4200', 'http://0.0.0.0:4200'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Theme Forum API is running',
        timestamp: new Date().toISOString(),
        database: 'File-based (JSON)'
    });
});

// API Routes
app.get('/api/themes', (req, res) => {
    try {
        const themes = Array.from(db.themes.values());
        res.json(themes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch themes' });
    }
});

app.get('/api/users', (req, res) => {
    try {
        const users = Array.from(db.users.values());
        // Remove sensitive information
        const safeUsers = users.map(user => ({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            created_at: user.created_at
        }));
        res.json(safeUsers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.get('/api/posts', (req, res) => {
    try {
        const posts = Array.from(db.posts.values());
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.get('/api/news', (req, res) => {
    try {
        const news = Array.from(db.news.values());
        res.json(news);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

app.get('/api/lottery', (req, res) => {
    try {
        const lottery = Array.from(db.lottery.values());
        res.json(lottery);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch lottery data' });
    }
});

app.get('/api/notifications', (req, res) => {
    try {
        const notifications = Array.from(db.notifications.values());
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

app.get('/api/notifications/unread-count', (req, res) => {
    try {
        const notifications = Array.from(db.notifications.values());
        const unreadCount = notifications.filter(n => !n.read).length;
        res.json({ unreadCount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Theme Forum API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            themes: '/api/themes',
            users: '/api/users',
            posts: '/api/posts',
            news: '/api/news',
            lottery: '/api/lottery',
            notifications: '/api/notifications'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Simple Theme Forum API running on port ${PORT}`);
    console.log(`🌍 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 Database: File-based (${db.themes.size} themes, ${db.users.size} users)`);
    console.log(`🔒 CORS enabled for: http://localhost:4200`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n⚠️  Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n⚠️  Shutting down gracefully...');
    process.exit(0);
});
