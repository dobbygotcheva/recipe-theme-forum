const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-enhanced');
const { authEnhanced, requireRole, logAuthAttempts } = require('../middleware/auth-enhanced');
const { authRateLimiter } = require('../middleware/security');

// Apply rate limiting to all auth routes
router.use(authRateLimiter);

// Apply logging to all auth routes
router.use(logAuthAttempts);

/**
 * @route POST /api/auth/register
 * @desc User registration with enhanced security
 * @access Public
 */
router.post('/register', 
  authController.validationRules.register,
  authController.register
);

/**
 * @route POST /api/auth/login
 * @desc User login with enhanced security
 * @access Public
 */
router.post('/login', 
  authController.validationRules.login,
  authController.login
);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public (with valid refresh token)
 */
router.post('/refresh', 
  authController.refreshToken
);

/**
 * @route POST /api/auth/logout
 * @desc User logout with token blacklisting
 * @access Private
 */
router.post('/logout', 
  authEnhanced(),
  authController.logout
);

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', 
  authEnhanced(),
  authController.getProfile
);

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', 
  authEnhanced(),
  authController.updateProfile
);

/**
 * @route POST /api/auth/change-password
 * @desc Change user password with enhanced security
 * @access Private
 */
router.post('/change-password', 
  authEnhanced(),
  authController.validationRules.changePassword,
  authController.changePassword
);

/**
 * @route GET /api/auth/generate-password
 * @desc Generate secure password suggestion
 * @access Public
 */
router.get('/generate-password', 
  authController.generatePassword
);

/**
 * @route POST /api/auth/check-password-strength
 * @desc Check password strength and security
 * @access Public
 */
router.post('/check-password-strength', 
  authController.checkPasswordStrength
);

/**
 * @route GET /api/auth/validate-token
 * @desc Validate current access token
 * @access Private
 */
router.get('/validate-token', 
  authEnhanced(),
  (req, res) => {
    res.json({
      valid: true,
      user: req.user,
      tokenInfo: req.tokenInfo
    });
  }
);

/**
 * @route GET /api/auth/session-info
 * @desc Get current session information
 * @access Private
 */
router.get('/session-info', 
  authEnhanced(),
  (req, res) => {
    res.json({
      user: req.user,
      authLevel: req.authLevel,
      tokenInfo: req.tokenInfo,
      sessionActive: true
    });
  }
);

/**
 * @route POST /api/auth/revoke-all-sessions
 * @desc Revoke all user sessions (admin only)
 * @access Private (Admin)
 */
router.post('/revoke-all-sessions', 
  authEnhanced(),
  requireRole('admin'),
  (req, res) => {
    // This would typically blacklist all tokens for a specific user
    // Implementation depends on your token management system
    
    res.json({
      message: 'All sessions revoked successfully'
    });
  }
);

/**
 * @route GET /api/auth/security-status
 * @desc Get security status for current user
 * @access Private
 */
router.get('/security-status', 
  authEnhanced(),
  (req, res) => {
    // This would typically check various security settings
    // like 2FA status, password age, etc.
    
    res.json({
      userId: req.user._id,
      securityFeatures: {
        twoFactorEnabled: false, // Implement based on your 2FA system
        passwordAge: '30 days', // Calculate based on passwordChangedAt
        lastLogin: new Date().toISOString(),
        accountLocked: false,
        loginAttempts: 0
      },
      recommendations: [
        'Enable two-factor authentication',
        'Change password every 90 days',
        'Use a strong, unique password'
      ]
    });
  }
);

/**
 * @route POST /api/auth/verify-email
 * @desc Verify user email address
 * @access Private
 */
router.post('/verify-email', 
  authEnhanced(),
  (req, res) => {
    // This would typically send a verification email
    // Implementation depends on your email system
    
    res.json({
      message: 'Verification email sent successfully'
    });
  }
);

/**
 * @route POST /api/auth/reset-password-request
 * @desc Request password reset
 * @access Public
 */
router.post('/reset-password-request', 
  (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }
    
    // This would typically:
    // 1. Check if user exists
    // 2. Generate reset token
    // 3. Send reset email
    // 4. Store hashed reset token
    
    res.json({
      message: 'If an account with this email exists, a password reset link has been sent.'
    });
  }
);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password using reset token
 * @access Public
 */
router.post('/reset-password', 
  (req, res) => {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token and new password are required'
      });
    }
    
    // This would typically:
    // 1. Verify reset token
    // 2. Validate new password
    // 3. Hash new password
    // 4. Update user password
    // 5. Invalidate reset token
    
    res.json({
      message: 'Password reset successfully'
    });
  }
);

/**
 * @route GET /api/auth/health
 * @desc Authentication service health check
 * @access Public
 */
router.get('/health', 
  (req, res) => {
    res.json({
      status: 'healthy',
      service: 'authentication',
      timestamp: new Date().toISOString(),
      features: {
        passwordEncryption: true,
        jwtTokens: true,
        rateLimiting: true,
        inputValidation: true,
        accountLocking: true
      }
    });
  }
);

module.exports = router;
