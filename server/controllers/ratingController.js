const { themes, users, saveThemes } = require('../config/db-simple');
const NotificationService = require('../utils/notificationService');

function addRating(req, res, next) {
    if (!req.user) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }

    const { themeId } = req.params;
    const { rating } = req.body;
    const { _id: userId, username } = req.user;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
        res.status(400).json({ message: "Rating must be between 1 and 5" });
        return;
    }

    const theme = themes.get(themeId);
    if (!theme) {
        res.status(404).json({ message: "Recipe not found" });
        return;
    }

    // Initialize ratings array if it doesn't exist
    if (!theme.ratings) {
        theme.ratings = [];
    }

    // Check if user already rated this recipe
    const existingRatingIndex = theme.ratings.findIndex(r => r.userId === userId);

    if (existingRatingIndex !== -1) {
        // Update existing rating
        theme.ratings[existingRatingIndex].rating = rating;
    } else {
        // Add new rating
        theme.ratings.push({ rating, userId, username });

        // Send notification for new rating
        NotificationService.notifyNewRating(themeId, theme.title, userId, rating);
    }

    // Calculate new average rating
    const totalRating = theme.ratings.reduce((sum, r) => sum + r.rating, 0);
    theme.averageRating = totalRating / theme.ratings.length;
    theme.totalRatings = theme.ratings.length;

    themes.set(themeId, theme);

    // Save themes to persistent storage
    const { saveThemes } = require('../config/db-simple');
    saveThemes();

    res.status(200).json({
        message: "Rating added successfully",
        averageRating: theme.averageRating,
        totalRatings: theme.totalRatings,
        userRating: rating
    });
}

function addComment(req, res, next) {
    if (!req.user) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }

    const { themeId } = req.params;
    const { text, parentCommentId } = req.body;
    const { _id: userId, username } = req.user;

    if (!text || text.trim().length === 0) {
        res.status(400).json({ message: "Comment text is required" });
        return;
    }

    const theme = themes.get(themeId);
    if (!theme) {
        res.status(404).json({ message: "Recipe not found" });
        return;
    }

    // Initialize comments array if it doesn't exist
    if (!theme.comments) {
        theme.comments = [];
    }

    // Add new comment
    const newComment = {
        _id: Date.now().toString(),
        text: text.trim(),
        userId,
        username,
        likes: [],
        dislikes: [],
        parentCommentId: parentCommentId || null,
        replies: [],
        created_at: new Date()
    };

    theme.comments.push(newComment);
    themes.set(themeId, theme);

    // Save themes to persistent storage
    saveThemes();

    // Send notification for new comment
    NotificationService.notifyNewComment(themeId, userId, text.trim());

    res.status(200).json({
        message: "Comment added successfully",
        comment: newComment
    });
}

function addReply(req, res, next) {
    if (!req.user) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }

    const { themeId, commentId } = req.params;
    const { text } = req.body;
    const { _id: userId, username } = req.user;

    if (!text || text.trim().length === 0) {
        res.status(400).json({ message: "Reply text is required" });
        return;
    }

    const theme = themes.get(themeId);
    if (!theme) {
        res.status(404).json({ message: "Recipe not found" });
        return;
    }

    // Initialize comments array if it doesn't exist
    if (!theme.comments) {
        theme.comments = [];
    }

    // Find the parent comment (can be a comment or a reply)
    const parentComment = theme.comments.find(c => c._id === commentId);
    if (!parentComment) {
        res.status(404).json({ message: "Parent comment not found" });
        return;
    }

    // Add new reply (can be a reply to a comment or a reply to a reply)
    const newReply = {
        _id: Date.now().toString(),
        text: text.trim(),
        userId,
        username,
        likes: [],
        dislikes: [],
        parentCommentId: commentId,
        replies: [],
        created_at: new Date()
    };

    theme.comments.push(newReply);
    themes.set(themeId, theme);

    // Save themes to persistent storage
    saveThemes();

    res.status(200).json({
        message: "Reply added successfully",
        reply: newReply
    });
}

function getRatings(req, res, next) {
    const { themeId } = req.params;

    const theme = themes.get(themeId);
    if (!theme) {
        res.status(404).json({ message: "Recipe not found" });
        return;
    }

    res.status(200).json({
        ratings: theme.ratings || [],
        averageRating: theme.averageRating || 0,
        totalRatings: theme.totalRatings || 0
    });
}

function getComments(req, res, next) {
    const { themeId } = req.params;

    const theme = themes.get(themeId);
    if (!theme) {
        res.status(404).json({ message: "Recipe not found" });
        return;
    }

    // Initialize comments array if it doesn't exist
    if (!theme.comments) {
        theme.comments = [];
    }

    // Organize comments hierarchically with support for nested replies
    const topLevelComments = theme.comments.filter(comment => !comment.parentCommentId);

    // Recursive function to organize replies at any level
    function organizeReplies(parentId) {
        const directReplies = theme.comments.filter(comment => comment.parentCommentId === parentId);
        return directReplies.map(reply => ({
            ...reply,
            replies: organizeReplies(reply._id) // Recursively get nested replies
        }));
    }

    // Attach replies to their parent comments recursively
    topLevelComments.forEach(comment => {
        comment.replies = organizeReplies(comment._id);
    });

    res.status(200).json({
        comments: topLevelComments
    });
}

function deleteComment(req, res, next) {
    if (!req.user) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }

    const { themeId, commentId } = req.params;
    const { _id: userId, role } = req.user;

    const theme = themes.get(themeId);
    if (!theme) {
        res.status(404).json({ message: "Recipe not found" });
        return;
    }

    // Initialize comments array if it doesn't exist
    if (!theme.comments) {
        theme.comments = [];
    }

    const comment = theme.comments.find(c => c._id === commentId);
    if (!comment) {
        res.status(404).json({ message: "Comment not found" });
        return;
    }

    // Check if user is authorized to delete this comment
    if (comment.userId !== userId && role !== 'admin') {
        res.status(401).json({ message: "Not authorized to delete this comment" });
        return;
    }

    // Remove the comment and all its replies
    theme.comments = theme.comments.filter(comment =>
        comment._id !== commentId && comment.parentCommentId !== commentId
    );

    themes.set(themeId, theme);
    res.status(200).json({ message: "Comment deleted successfully" });
}

function likeComment(req, res, next) {
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

    // Initialize comments array if it doesn't exist
    if (!theme.comments) {
        theme.comments = [];
    }

    const comment = theme.comments.find(c => c._id === commentId);
    if (!comment) {
        res.status(404).json({ message: "Comment not found" });
        return;
    }

    // Initialize likes and dislikes arrays if they don't exist
    if (!comment.likes) comment.likes = [];
    if (!comment.dislikes) comment.dislikes = [];

    // Check if user already liked this comment
    const alreadyLiked = comment.likes.includes(userId);
    const alreadyDisliked = comment.dislikes.includes(userId);

    if (alreadyLiked) {
        // Remove like
        comment.likes = comment.likes.filter(id => id !== userId);
    } else {
        // Add like and remove dislike if exists
        comment.likes.push(userId);
        comment.dislikes = comment.dislikes.filter(id => id !== userId);
    }

    themes.set(themeId, theme);
    res.status(200).json({ message: "Comment like updated successfully" });
}

function dislikeComment(req, res, next) {
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

    // Initialize comments array if it doesn't exist
    if (!theme.comments) {
        theme.comments = [];
    }

    const comment = theme.comments.find(c => c._id === commentId);
    if (!comment) {
        res.status(404).json({ message: "Comment not found" });
        return;
    }

    // Initialize likes and dislikes arrays if they don't exist
    if (!comment.likes) comment.likes = [];
    if (!comment.dislikes) comment.dislikes = [];

    // Check if user already disliked this comment
    const alreadyDisliked = comment.dislikes.includes(userId);
    const alreadyLiked = comment.likes.includes(userId);

    if (alreadyDisliked) {
        // Remove dislike
        comment.dislikes = comment.dislikes.filter(id => id !== userId);
    } else {
        // Add dislike and remove like if exists
        comment.dislikes.push(userId);
        comment.likes = comment.likes.filter(id => id !== userId);
    }

    themes.set(themeId, theme);
    res.status(200).json({ message: "Comment dislike updated successfully" });
}

module.exports = {
    addRating,
    addComment,
    addReply,
    getRatings,
    getComments,
    deleteComment,
    likeComment,
    dislikeComment
}; 