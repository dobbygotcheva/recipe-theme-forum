const express = require('express');
const router = express.Router();
const { auth } = require('../utils');
const { themeController, postController, ratingController } = require('../controllers');
const upload = require('../utils/upload');
const videoUpload = require('../utils/videoUpload');

// middleware that is specific to this router

router.get('/', themeController.getThemes);
router.get('/my-recipes', auth(), themeController.getMyThemes);
router.get('/favorites', auth(), themeController.getFavorites);
router.get('/liked', auth(), themeController.getLikedRecipes);
router.post('/', auth(), upload.single('image'), themeController.createTheme);
router.post('/upload', auth(), upload.single('image'), themeController.createThemeWithImage);
router.delete('/:themeId', auth(), themeController.deleteTheme);
router.put('/:themeId', auth(), themeController.editTheme);

// Recipe interaction routes
router.post('/:themeId/rate', auth(), themeController.rateRecipe);
// Use ratingController for hierarchical comments
router.post('/:themeId/comment', auth(), ratingController.addComment);
router.delete('/:themeId/comment/:commentId', auth(), ratingController.deleteComment);
router.post('/:themeId/like', auth(), themeController.likeRecipe);
router.post('/:themeId/favorite', auth(), themeController.toggleFavorite);

router.get('/:themeId', themeController.getTheme);
router.post('/:themeId', postController.createPost);
router.put('/:themeId', themeController.subscribe);
router.put('/:themeId/posts/:postId', postController.editPost);
router.delete('/:themeId/posts/:postId', postController.deletePost);

module.exports = router