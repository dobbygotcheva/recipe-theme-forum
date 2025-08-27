const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { validateUser } = require('../validators/form-validation');
const { requireAuth, requireRole } = require('../middleware/auth-enhanced');
const { authRateLimiter } = require('../middleware/security-enhanced');

/**
 * User Routes
 * RESTful API endpoints for user operations
 */

// Public routes (no authentication required)
router.post('/register',
  authRateLimiter,
  validateUser('register'),
  userController.register
);

router.post('/login',
  authRateLimiter,
  validateUser('login'),
  userController.login
);

router.post('/refresh-token',
  userController.refreshToken
);

router.get('/health',
  userController.healthCheck
);

// Protected routes (authentication required)
router.use(requireAuth); // Apply authentication middleware to all routes below

router.get('/profile',
  userController.getProfile
);

router.put('/profile',
  validateUser('profile'),
  userController.updateProfile
);

router.post('/change-password',
  userController.changePassword
);

router.post('/logout',
  userController.logout
);

// Admin routes (admin role required)
router.get('/admin/users',
  requireRole('admin'),
  userController.getAllUsers
);

router.put('/admin/users/:userId/role',
  requireRole('admin'),
  userController.updateUserRole
);

router.put('/admin/users/:userId/deactivate',
  requireRole('admin'),
  userController.deactivateUser
);

router.put('/admin/users/:userId/activate',
  requireRole('admin'),
  userController.activateUser
);

module.exports = router;
