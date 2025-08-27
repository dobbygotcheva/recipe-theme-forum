const express = require('express');
const router = express.Router();
const themeController = require('../controllers/theme.controller');
const { validateTheme } = require('../validators/form-validation');
const { requireAuth, requireRole } = require('../middleware/auth-enhanced');
const { apiRateLimiter, uploadRateLimiter } = require('../middleware/security-enhanced');

/**
 * Theme Routes
 * RESTful API endpoints for theme/recipe operations
 */

// Public routes (no authentication required)
router.get('/', apiRateLimiter, themeController.getThemes);
router.get('/popular', apiRateLimiter, themeController.getPopularThemes);
router.get('/trending', apiRateLimiter, themeController.getTrendingThemes);
router.get('/search', apiRateLimiter, themeController.searchThemes);
router.get('/stats', apiRateLimiter, themeController.getThemeStats);
router.get('/:themeId', apiRateLimiter, themeController.getThemeById);
router.get('/author/:authorId', apiRateLimiter, themeController.getThemesByAuthor);

// Protected routes (authentication required)
router.use(requireAuth);

router.post('/', uploadRateLimiter, validateTheme('create'), themeController.createTheme);
router.put('/:themeId', uploadRateLimiter, validateTheme('update'), themeController.updateTheme);
router.delete('/:themeId', themeController.deleteTheme);
router.post('/:themeId/publish', themeController.publishTheme);
router.post('/:themeId/unpublish', themeController.unpublishTheme);
router.post('/:themeId/like', themeController.likeTheme);
router.post('/:themeId/unlike', themeController.unlikeTheme);
router.post('/:themeId/rate', themeController.rateTheme);
router.get('/my/themes', themeController.getMyThemes);

// Admin routes (admin role required)
router.get('/admin/pending', requireRole('admin'), themeController.getPendingThemes);
router.post('/admin/:themeId/approve', requireRole('admin'), themeController.approveTheme);
router.post('/admin/:themeId/reject', requireRole('admin'), themeController.rejectTheme);

// Health check
router.get('/health/check', themeController.healthCheck);

module.exports = router;
