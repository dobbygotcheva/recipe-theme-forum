const { favorites, users, themes } = require('../config/db-simple');

// Add recipe to favorites
function addToFavorites(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { themeId } = req.params;
        const { _id: userId } = req.user;

        // Check if theme exists
        const theme = themes.get(themeId);
        if (!theme) {
            res.status(404).json({ message: "Recipe not found" });
            return;
        }

        // Check if user exists
        const user = users.get(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Initialize favorites array if it doesn't exist
        if (!user.favorites) {
            user.favorites = [];
        }

        // Check if already in favorites
        if (user.favorites.includes(themeId)) {
            res.status(400).json({ message: "Recipe already in favorites" });
            return;
        }

        // Add to favorites
        user.favorites.push(themeId);
        users.set(userId, user);

        // Create favorite record
        const favoriteId = Date.now().toString();
        const favorite = {
            _id: favoriteId,
            userId: userId,
            themeId: themeId,
            created_at: new Date()
        };
        favorites.set(favoriteId, favorite);

        // Save the database
        require('../config/db-simple').saveUsers();
        require('../config/db-simple').saveFavorites();

        res.status(200).json({
            message: "Recipe added to favorites successfully",
            favorite: favorite
        });
    } catch (error) {
        next(error);
    }
}

// Remove recipe from favorites
function removeFromFavorites(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { themeId } = req.params;
        const { _id: userId } = req.user;

        // Check if user exists
        const user = users.get(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Initialize favorites array if it doesn't exist
        if (!user.favorites) {
            user.favorites = [];
        }

        // Check if in favorites
        const favoriteIndex = user.favorites.indexOf(themeId);
        if (favoriteIndex === -1) {
            res.status(400).json({ message: "Recipe not in favorites" });
            return;
        }

        // Remove from favorites
        user.favorites.splice(favoriteIndex, 1);
        users.set(userId, user);

        // Remove favorite record
        for (const [favoriteId, favorite] of favorites.entries()) {
            if (favorite.userId === userId && favorite.themeId === themeId) {
                favorites.delete(favoriteId);
                break;
            }
        }

        // Save the database
        require('../config/db-simple').saveUsers();
        require('../config/db-simple').saveFavorites();

        res.status(200).json({
            message: "Recipe removed from favorites successfully"
        });
    } catch (error) {
        next(error);
    }
}

// Get user favorites
function getUserFavorites(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { _id: userId } = req.user;

        // Check if user exists
        const user = users.get(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Initialize favorites array if it doesn't exist
        if (!user.favorites) {
            user.favorites = [];
        }

        // Get favorite themes with full details
        const favoriteThemes = user.favorites
            .map(themeId => themes.get(themeId))
            .filter(theme => theme !== undefined); // Remove any undefined themes

        res.status(200).json(favoriteThemes);
    } catch (error) {
        next(error);
    }
}

// Check if recipe is in favorites
function checkFavorite(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { themeId } = req.params;
        const { _id: userId } = req.user;

        // Check if user exists
        const user = users.get(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Initialize favorites array if it doesn't exist
        if (!user.favorites) {
            user.favorites = [];
        }

        const isFavorite = user.favorites.includes(themeId);

        res.status(200).json({
            isFavorite: isFavorite
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    addToFavorites,
    removeFromFavorites,
    getUserFavorites,
    checkFavorite
};
