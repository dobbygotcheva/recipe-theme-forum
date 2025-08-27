const { themes, users } = require('../config/db-simple');
const { newPost } = require('./postController');
const NotificationService = require('../utils/notificationService');

function getThemes(req, res, next) {
    try {
        // Set cache-busting headers to prevent browser caching
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        // Convert Map to Array and add default values for ratings
        let themesArray = Array.from(themes.values()).map(theme => ({
            ...theme,
            averageRating: theme.averageRating || 0,
            totalRatings: theme.totalRatings || 0,
            ratings: theme.ratings || [],
            comments: theme.comments || []
        }));

        // If user is not admin, only show approved themes
        if (!req.user || req.user.role !== 'admin') {
            themesArray = themesArray.filter(theme =>
                theme.status === 'approved' || theme.status === undefined
            );
        }

        res.json(themesArray);
    } catch (error) {
        next(error);
    }
}

function getMyThemes(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        // Get themes created by the current user
        const userThemes = Array.from(themes.values()).filter(theme =>
            theme.authorId === req.user._id || theme.author === req.user.username
        );

        // Add default values for ratings
        const themesArray = userThemes.map(theme => ({
            ...theme,
            averageRating: theme.averageRating || 0,
            totalRatings: theme.totalRatings || 0,
            ratings: theme.ratings || [],
            comments: theme.comments || []
        }));

        res.json(themesArray);
    } catch (error) {
        next(error);
    }
}

function getTheme(req, res, next) {
    try {
        const { themeId } = req.params;
        const theme = themes.get(themeId);

        if (!theme) {
            res.status(404).json({ message: "Theme not found" });
            return;
        }

        res.json(theme);
    } catch (error) {
        next(error);
    }
}

// Helper function to extract YouTube video ID
function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Helper function to validate YouTube URL
function isValidYouTubeUrl(url) {
    return extractYouTubeId(url) !== null;
}

// title, category, img, time, ingredients, text
function createTheme(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        console.log('=== CREATE THEME DEBUG ===');
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);
        console.log('Request file:', req.file);
        console.log('User:', req.user);

        const { title, category, time, ingredients, text, videoUrl, protein, fats, carbs, calories } = req.body;
        const { _id: userId } = req.user;

        console.log('Extracted data:', { title, category, time, ingredients, text, videoUrl, protein, fats, carbs, calories, userId });

        // Handle file upload
        let imgUrl = '';
        if (req.file) {
            // Return full URL for uploaded files
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            imgUrl = `${baseUrl}/uploads/${req.file.filename}`;
            console.log('Image file uploaded:', imgUrl);
        } else if (req.body.img) {
            imgUrl = req.body.img; // Fallback to URL if no file uploaded
            console.log('Image URL provided:', imgUrl);
        }

        // Handle video
        let videoData = {};
        if (videoUrl && isValidYouTubeUrl(videoUrl)) {
            videoData = {
                videoUrl: videoUrl,
                videoType: 'youtube'
            };
            console.log('YouTube video URL:', videoUrl);
        } else if (req.files && req.files.video) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            videoData = {
                videoFile: `${baseUrl}/uploads/videos/${req.files.video[0].filename}`,
                videoType: 'upload'
            };
            console.log('Video file uploaded:', videoData);
        }

        const themeId = Date.now().toString();
        const newTheme = {
            _id: themeId,
            title,
            category,
            img: imgUrl,
            time,
            ingredients,
            text,
            userId,
            authorId: userId, // Add authorId for compatibility
            author: req.user.username, // Add author name
            subscribers: [],
            ratings: [],
            comments: [],
            averageRating: 0,
            totalRatings: 0,
            status: 'pending', // Default status for moderation
            created_at: new Date(),
            // Nutritional information
            protein: protein ? parseFloat(protein) : undefined,
            fats: fats ? parseFloat(fats) : undefined,
            carbs: carbs ? parseFloat(carbs) : undefined,
            calories: calories ? parseInt(calories) : undefined,
            ...videoData
        };

        console.log('Creating new theme:', newTheme);
        themes.set(themeId, newTheme);

        // Save to persistent storage
        const { saveThemes } = require('../config/db-simple');
        saveThemes();
        console.log('✅ Theme saved to database');

        // Create initial post
        newPost('', userId, themeId)
            .then(() => {
                console.log('Theme created successfully');

                // Send notification for new post
                NotificationService.notifyNewPost(themeId, title, userId);

                res.status(200).json(newTheme);
            })
            .catch(next);
    } catch (error) {
        console.error('Error creating theme:', error);
        next(error);
    }
}

function deleteTheme(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { themeId } = req.params;
        const { _id: userId } = req.user;

        const theme = themes.get(themeId);
        if (!theme) {
            res.status(404).json({ message: "Theme not found" });
            return;
        }

        if (theme.userId !== userId) {
            res.status(401).json({ message: "Not allowed!" });
            return;
        }

        themes.delete(themeId);
        res.status(200).json({ message: "Theme deleted successfully" });
    } catch (error) {
        next(error);
    }
}

// Rate a recipe
function rateRecipe(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { themeId } = req.params;
        const { rating } = req.body;
        const { _id: userId, username } = req.user;

        if (!rating || rating < 1 || rating > 5) {
            res.status(400).json({ message: "Rating must be between 1 and 5" });
            return;
        }

        const theme = themes.get(themeId);
        if (!theme) {
            res.status(404).json({ message: "Recipe not found" });
            return;
        }

        // Initialize arrays if they don't exist
        if (!theme.ratings) theme.ratings = [];
        if (!theme.averageRating) theme.averageRating = 0;
        if (!theme.totalRatings) theme.totalRatings = 0;

        // Check if user already rated
        const existingRatingIndex = theme.ratings.findIndex(r => r.userId === userId);

        if (existingRatingIndex !== -1) {
            // Update existing rating
            theme.ratings[existingRatingIndex] = { rating, userId, username };
        } else {
            // Add new rating
            theme.ratings.push({ rating, userId, username });
            theme.totalRatings++;
        }

        // Calculate new average rating
        const totalRating = theme.ratings.reduce((sum, r) => sum + r.rating, 0);
        theme.averageRating = totalRating / theme.ratings.length;

        themes.set(themeId, theme);
        res.json({
            message: "Rating updated successfully",
            averageRating: theme.averageRating,
            totalRatings: theme.totalRatings
        });
    } catch (error) {
        next(error);
    }
}

// Add comment to a recipe
function addComment(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { themeId } = req.params;
        const { comment } = req.body;
        const { _id: userId, username } = req.user;

        if (!comment || comment.trim().length === 0) {
            res.status(400).json({ message: "Comment cannot be empty" });
            return;
        }

        const theme = themes.get(themeId);
        if (!theme) {
            res.status(404).json({ message: "Recipe not found" });
            return;
        }

        // Initialize comments array if it doesn't exist
        if (!theme.comments) theme.comments = [];

        const newComment = {
            _id: Date.now().toString(),
            userId,
            username,
            comment: comment.trim(),
            created_at: new Date()
        };

        theme.comments.push(newComment);
        themes.set(themeId, theme);

        res.json({
            message: "Comment added successfully",
            comment: newComment
        });
    } catch (error) {
        next(error);
    }
}

// Delete comment
function deleteComment(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { themeId, commentId } = req.params;
        const { _id: userId } = req.user;

        const theme = themes.get(themeId);
        if (!theme) {
            res.status(404).json({ message: "Recipe not found" });
            return;
        }

        if (!theme.comments) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }

        const commentIndex = theme.comments.findIndex(c => c._id === commentId);
        if (commentIndex === -1) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }

        const comment = theme.comments[commentIndex];
        if (comment.userId !== userId && req.user.role !== 'admin') {
            res.status(401).json({ message: "Not authorized to delete this comment" });
            return;
        }

        theme.comments.splice(commentIndex, 1);
        themes.set(themeId, theme);

        res.json({ message: "Comment deleted successfully" });
    } catch (error) {
        next(error);
    }
}

// Like/Dislike a recipe
function likeRecipe(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { themeId } = req.params;
        const { action } = req.body; // 'like' or 'dislike'
        const { _id: userId } = req.user;

        if (!['like', 'dislike'].includes(action)) {
            res.status(400).json({ message: "Action must be 'like' or 'dislike'" });
            return;
        }

        const theme = themes.get(themeId);
        if (!theme) {
            res.status(404).json({ message: "Recipe not found" });
            return;
        }

        // Initialize like/dislike arrays if they don't exist
        if (!theme.likes) theme.likes = [];
        if (!theme.dislikes) theme.dislikes = [];

        // Remove from opposite array first
        if (action === 'like') {
            theme.dislikes = theme.dislikes.filter(id => id !== userId);
            const likeIndex = theme.likes.indexOf(userId);
            if (likeIndex === -1) {
                theme.likes.push(userId);
            } else {
                theme.likes.splice(likeIndex, 1); // Unlike
            }
        } else {
            theme.likes = theme.likes.filter(id => id !== userId);
            const dislikeIndex = theme.dislikes.indexOf(userId);
            if (dislikeIndex === -1) {
                theme.dislikes.push(userId);
            } else {
                theme.dislikes.splice(dislikeIndex, 1); // Undislike
            }
        }

        themes.set(themeId, theme);
        res.json({
            message: "Action completed successfully",
            likes: theme.likes.length,
            dislikes: theme.dislikes.length,
            userLiked: theme.likes.includes(userId),
            userDisliked: theme.dislikes.includes(userId)
        });
    } catch (error) {
        next(error);
    }
}

// Add/Remove from favorites
function toggleFavorite(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { themeId } = req.params;
        const { _id: userId } = req.user;

        const theme = themes.get(themeId);
        if (!theme) {
            res.status(404).json({ message: "Recipe not found" });
            return;
        }

        // Initialize favorites array if it doesn't exist
        if (!theme.favorites) theme.favorites = [];

        const favoriteIndex = theme.favorites.indexOf(userId);
        if (favoriteIndex === -1) {
            // Add to favorites
            theme.favorites.push(userId);
            themes.set(themeId, theme);
            res.json({
                message: "Added to favorites",
                isFavorite: true
            });
        } else {
            // Remove from favorites
            theme.favorites.splice(favoriteIndex, 1);
            themes.set(themeId, theme);
            res.json({
                message: "Removed from favorites",
                isFavorite: false
            });
        }
    } catch (error) {
        next(error);
    }
}

// Get user's favorite recipes
function getFavorites(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { _id: userId } = req.user;
        const favoriteThemes = Array.from(themes.values()).filter(theme =>
            theme.favorites && theme.favorites.includes(userId)
        );

        res.json(favoriteThemes);
    } catch (error) {
        next(error);
    }
}

// Get user's liked recipes
function getLikedRecipes(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { _id: userId } = req.user;
        const likedThemes = Array.from(themes.values()).filter(theme =>
            theme.likes && theme.likes.includes(userId)
        );

        res.json(likedThemes);
    } catch (error) {
        next(error);
    }
}

function editTheme(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { themeId } = req.params;
        const { title, category, time, ingredients, text, videoUrl, protein, fats, carbs, calories } = req.body;
        const { _id: userId } = req.user;

        const theme = themes.get(themeId);
        if (!theme) {
            res.status(404).json({ message: "Theme not found" });
            return;
        }

        if (theme.userId !== userId) {
            res.status(401).json({ message: "Not allowed!" });
            return;
        }

        // Handle file upload for editing
        let imgUrl = theme.img; // Keep existing image by default
        if (req.file) {
            // Return full URL for uploaded files
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            imgUrl = `${baseUrl}/uploads/${req.file.filename}`;
        } else if (req.body.img) {
            imgUrl = req.body.img; // Fallback to URL if no file uploaded
        }

        // Handle video for editing
        let videoData = {};
        if (videoUrl && isValidYouTubeUrl(videoUrl)) {
            videoData = {
                videoUrl: videoUrl,
                videoType: 'youtube'
            };
        } else if (req.files && req.files.video) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            videoData = {
                videoFile: `${baseUrl}/uploads/videos/${req.files.video[0].filename}`,
                videoType: 'upload'
            };
        } else if (videoUrl === '') {
            // Clear video data if empty string is sent
            videoData = {
                videoUrl: null,
                videoFile: null,
                videoType: null
            };
        }

        // Update theme
        const updatedTheme = {
            ...theme,
            title,
            category,
            img: imgUrl,
            time,
            ingredients,
            text,
            // Nutritional information
            protein: protein ? parseFloat(protein) : undefined,
            fats: fats ? parseFloat(fats) : undefined,
            carbs: carbs ? parseFloat(carbs) : undefined,
            calories: calories ? parseInt(calories) : undefined,
            ...videoData
        };

        themes.set(themeId, updatedTheme);
        res.status(200).json(updatedTheme);
    } catch (error) {
        next(error);
    }
}

function subscribe(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const themeId = req.params.themeId;
        const { _id: userId } = req.user;

        const theme = themes.get(themeId);
        if (!theme) {
            res.status(404).json({ message: "Theme not found" });
            return;
        }

        if (!theme.subscribers.includes(userId)) {
            theme.subscribers.push(userId);
            themes.set(themeId, theme);
        }

        res.status(200).json(theme);
    } catch (error) {
        next(error);
    }
}

// Special method for creating theme with image upload
function createThemeWithImage(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        console.log('=== CREATE THEME WITH IMAGE DEBUG ===');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        console.log('User:', req.user);

        const { title, category, time, ingredients, text, videoUrl, protein, fats, carbs, calories } = req.body;
        const { _id: userId } = req.user;

        // Handle file upload
        let imgUrl = '';
        if (req.file) {
            // Return full URL for uploaded files
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            imgUrl = `${baseUrl}/uploads/${req.file.filename}`;
            console.log('Image file uploaded:', imgUrl);
        }

        // Handle video
        let videoData = {};
        if (videoUrl && isValidYouTubeUrl(videoUrl)) {
            videoData = {
                videoUrl: videoUrl,
                videoType: 'youtube'
            };
            console.log('YouTube video URL:', videoUrl);
        }

        const themeId = Date.now().toString();
        const newTheme = {
            _id: themeId,
            title,
            category,
            img: imgUrl,
            time,
            ingredients,
            text,
            userId,
            authorId: userId,
            author: req.user.username,
            subscribers: [],
            ratings: [],
            comments: [],
            averageRating: 0,
            totalRatings: 0,
            status: 'pending',
            created_at: new Date(),
            // Nutritional information
            protein: protein ? parseFloat(protein) : undefined,
            fats: fats ? parseFloat(fats) : undefined,
            carbs: carbs ? parseFloat(carbs) : undefined,
            calories: calories ? parseInt(calories) : undefined,
            ...videoData
        };

        console.log('Creating new theme with image:', newTheme);
        themes.set(themeId, newTheme);

        // Save to persistent storage
        const { saveThemes } = require('../config/db-simple');
        saveThemes();
        console.log('✅ Theme with image saved to database');

        // Create initial post
        newPost('', userId, themeId)
            .then(() => {
                console.log('Theme with image created successfully');

                // Send notification for new post
                NotificationService.notifyNewPost(themeId, title, userId);

                res.status(200).json(newTheme);
            })
            .catch(next);
    } catch (error) {
        console.error('Error creating theme with image:', error);
        next(error);
    }
}

module.exports = {
    getThemes,
    getMyThemes,
    createTheme,
    createThemeWithImage,
    getTheme,
    subscribe,
    deleteTheme,
    editTheme,
    rateRecipe,
    addComment,
    deleteComment,
    likeRecipe,
    toggleFavorite,
    getFavorites,
    getLikedRecipes
}