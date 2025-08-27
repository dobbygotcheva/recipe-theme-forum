const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const { auth } = require('../utils');

// Apply auth middleware to all favorites routes
router.use(auth());

// Get user favorites
router.get('/', favoritesController.getUserFavorites);

// Add recipe to favorites
router.post('/:themeId', favoritesController.addToFavorites);

// Remove recipe from favorites
router.delete('/:themeId', favoritesController.removeFromFavorites);

// Check if recipe is in favorites
router.get('/:themeId/check', favoritesController.checkFavorite);

module.exports = router;
