const { users, themes, posts, news, saveNews } = require('../config/db-simple');
const NotificationService = require('../utils/notificationService');

// Export news for other modules to use
module.exports.news = news;

// Sample news data is now loaded from the persistent database

// Get all news (for admin)
function getAllNews(req, res, next) {
    try {
        const newsArray = Array.from(news.values());
        res.json(newsArray);
    } catch (error) {
        next(error);
    }
}

// Get published news (for public)
function getPublishedNews(req, res, next) {
    try {
        const publishedNews = Array.from(news.values()).filter(article =>
            article.status === 'published'
        );
        res.json(publishedNews);
    } catch (error) {
        next(error);
    }
}

// Get single news article
function getNewsById(req, res, next) {
    try {
        const { id } = req.params;
        const article = news.get(id);

        if (!article) {
            res.status(404).json({ message: "News article not found" });
            return;
        }

        // Increment views for published articles
        if (article.status === 'published') {
            article.views = (article.views || 0) + 1;
            news.set(id, article);

            // Save to persistent storage
            saveNews();
        }

        res.json(article);
    } catch (error) {
        next(error);
    }
}

// Create news article
function createNews(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { title, summary, content, tags, featured, image } = req.body;
        const { _id: userId, username } = req.user;

        const newsId = Date.now().toString();
        const newArticle = {
            _id: newsId,
            title,
            summary,
            content,
            author: {
                _id: userId,
                username
            },
            status: 'published',
            tags: tags || [],
            featured: featured || false,
            image: image || '',
            created_at: new Date(),
            published_at: new Date(),
            views: 0
        };

        news.set(newsId, newArticle);

        // Save to persistent storage
        saveNews();
        console.log(`✅ News article created and saved: ${title}`);

        // Send notification for new news
        NotificationService.notifyNewNews(newsId, title, userId);

        res.status(201).json(newArticle);
    } catch (error) {
        next(error);
    }
}

// Update news article
function updateNews(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { id } = req.params;
        const { title, summary, content, tags, featured, image } = req.body;

        const article = news.get(id);
        if (!article) {
            res.status(404).json({ message: "News article not found" });
            return;
        }

        // Only allow author or admin to edit
        if (article.author._id !== req.user._id && req.user.role !== 'admin') {
            res.status(403).json({ message: "Not authorized to edit this article" });
            return;
        }

        const updatedArticle = {
            ...article,
            title,
            summary,
            content,
            tags: tags || [],
            featured: featured || false,
            image: image || '',
            updated_at: new Date()
        };

        news.set(id, updatedArticle);

        // Save to persistent storage
        saveNews();
        console.log(`✅ News article updated and saved: ${title}`);

        res.json(updatedArticle);
    } catch (error) {
        next(error);
    }
}

// Delete news article
function deleteNews(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { id } = req.params;
        const article = news.get(id);

        if (!article) {
            res.status(404).json({ message: "News article not found" });
            return;
        }

        // Only allow author or admin to delete
        if (article.author._id !== req.user._id && req.user.role !== 'admin') {
            res.status(403).json({ message: "Not authorized to delete this article" });
            return;
        }

        news.delete(id);

        // Save to persistent storage
        saveNews();
        console.log(`✅ News article deleted: ${id}`);

        res.json({ message: "News article deleted successfully" });
    } catch (error) {
        next(error);
    }
}

// Publish news article
function publishNews(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { id } = req.params;
        const article = news.get(id);

        if (!article) {
            res.status(404).json({ message: "News article not found" });
            return;
        }

        // Only allow author or admin to publish
        if (article.author._id !== req.user._id && req.user.role !== 'admin') {
            res.status(403).json({ message: "Not authorized to publish this article" });
            return;
        }

        article.status = 'published';
        article.published_at = new Date();
        news.set(id, article);

        // Save to persistent storage
        saveNews();
        console.log(`✅ News article published and saved: ${article.title}`);

        // Send notification for new news
        NotificationService.notifyNewNews(id, article.title, req.user._id);

        res.json(article);
    } catch (error) {
        next(error);
    }
}

// Archive news article
function archiveNews(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { id } = req.params;
        const article = news.get(id);

        if (!article) {
            res.status(404).json({ message: "News article not found" });
            return;
        }

        // Only allow author or admin to archive
        if (article.author._id !== req.user._id && req.user.role !== 'admin') {
            res.status(403).json({ message: "Not authorized to archive this article" });
            return;
        }

        article.status = 'archived';
        news.set(id, article);

        // Save to persistent storage
        saveNews();
        console.log(`✅ News article archived and saved: ${article.title}`);

        res.json(article);
    } catch (error) {
        next(error);
    }
}

// Upload news image
function uploadNewsImage(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({
            message: "Image uploaded successfully",
            imageUrl
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllNews,
    getPublishedNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    publishNews,
    archiveNews,
    uploadNewsImage
};
