const userService = require('../services/user.service');

/**
 * User Controller
 * Handles HTTP requests and responses for user operations
 */
class UserController {
  /**
     * Register a new user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async register(req, res) {
    try {
      const result = await userService.createUser(req.body);

      res.status(201).json({
        success: true,
        data: result.data,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'USER_CREATION_FAILED',
          message: error.message
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
     * Authenticate user login
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_CREDENTIALS',
            message: 'Email and password are required'
          },
          timestamp: new Date().toISOString()
        });
      }

      const result = await userService.authenticateUser(email, password);

      // Set secure HTTP-only cookies
      res.cookie('accessToken', result.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', result.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          user: result.data.user,
          message: result.message
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: error.message
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
     * Get user profile
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const result = await userService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: error.message
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
     * Update user profile
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      const result = await userService.updateUserProfile(userId, updateData);

      res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'PROFILE_UPDATE_FAILED',
          message: error.message
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
     * Change user password
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PASSWORD_DATA',
            message: 'Current password and new password are required'
          },
          timestamp: new Date().toISOString()
        });
      }

      const result = await userService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_CHANGE_FAILED',
          message: error.message
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
     * Refresh access token
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REFRESH_TOKEN',
            message: 'Refresh token is required'
          },
          timestamp: new Date().toISOString()
        });
      }

      const result = await userService.refreshAccessToken(refreshToken);

      // Set new access token cookie
      res.cookie('accessToken', result.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.status(200).json({
        success: true,
        data: {
          user: result.data.user,
          message: result.message
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REFRESH_FAILED',
          message: error.message
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
     * Logout user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async logout(req, res) {
    try {
      const userId = req.user.id;
      await userService.logoutUser(userId);

      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_FAILED',
          message: error.message
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
     * Get all users (admin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async getAllUsers(req, res) {
    try {
      const { page, limit, search, role } = req.query;
      const options = { page, limit, search, role };

      const result = await userService.getAllUsers(options);

      res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'USERS_RETRIEVAL_FAILED',
          message: error.message
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
     * Update user role (admin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async updateUserRole(req, res) {
    try {
      const { userId } = req.params;
      const { newRole } = req.body;

      if (!newRole) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_ROLE_DATA',
            message: 'New role is required'
          },
          timestamp: new Date().toISOString()
        });
      }

      const result = await userService.updateUserRole(userId, newRole);

      res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'ROLE_UPDATE_FAILED',
          message: error.message
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
     * Deactivate user (admin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async deactivateUser(req, res) {
    try {
      const { userId } = req.params;
      const result = await userService.deactivateUser(userId);

      res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'USER_DEACTIVATION_FAILED',
          message: error.message
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
     * Activate user (admin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async activateUser(req, res) {
    try {
      const { userId } = req.params;
      const result = await userService.activateUser(userId);

      res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'USER_ACTIVATION_FAILED',
          message: error.message
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
     * Health check endpoint
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async healthCheck(req, res) {
    res.status(200).json({
      success: true,
      data: {
        service: 'User Service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  }
}

module.exports = new UserController();
