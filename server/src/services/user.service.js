const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt-enhanced');
const { hashPassword, comparePassword } = require('../utils/password-security');

/**
 * User Service
 * Handles business logic for user operations
 */
class UserService {
  constructor() {
    this.saltRounds = 12;
  }

  /**
     * Create a new user
     * @param {Object} userData - User data
     * @returns {Promise<Object>} Created user
     */
  async createUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email.toLowerCase() },
          { username: userData.username.toLowerCase() }
        ]
      });

      if (existingUser) {
        throw new Error('User with this email or username already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user
      const user = new User({
        ...userData,
        email: userData.email.toLowerCase(),
        username: userData.username.toLowerCase(),
        password: hashedPassword,
        role: 'user',
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        lastLogin: null,
        loginAttempts: 0,
        lockedUntil: null
      });

      const savedUser = await user.save();

      // Remove password from response
      const userResponse = savedUser.toObject();
      delete userResponse.password;

      return {
        success: true,
        data: userResponse,
        message: 'User created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
     * Authenticate user login
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Authentication result
     */
  async authenticateUser(email, password) {
    try {
      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw new Error('Account is temporarily locked. Please try again later.');
      }

      // Check if account is active
      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact support.');
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        // Increment login attempts
        user.loginAttempts += 1;

        // Lock account after 5 failed attempts
        if (user.loginAttempts >= 5) {
          user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        }

        await user.save();
        throw new Error('Invalid credentials');
      }

      // Reset login attempts on successful login
      user.loginAttempts = 0;
      user.lockedUntil = null;
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return {
        success: true,
        data: {
          user: userResponse,
          accessToken,
          refreshToken
        },
        message: 'Login successful'
      };
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User data
     */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: user,
        message: 'User retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated user
     */
  async updateUserProfile(userId, updateData) {
    try {
      // Remove sensitive fields from update data
      const { password, email, role, ...safeUpdateData } = updateData;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { ...safeUpdateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  /**
     * Change user password
     * @param {string} userId - User ID
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Success message
     */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password
      user.password = hashedNewPassword;
      user.updatedAt = new Date();
      await user.save();

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      throw new Error(`Failed to change password: ${error.message}`);
    }
  }

  /**
     * Refresh access token
     * @param {string} refreshToken - Refresh token
     * @returns {Promise<Object>} New access token
     */
  async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Get user
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('User account is deactivated');
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(user._id, user.role);

      return {
        success: true,
        data: {
          accessToken: newAccessToken,
          user
        },
        message: 'Token refreshed successfully'
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
     * Logout user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Success message
     */
  async logoutUser(userId) {
    try {
      // In a real application, you might want to blacklist the refresh token
      // For now, we'll just return success

      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  /**
     * Get all users (admin only)
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Users list
     */
  async getAllUsers(options = {}) {
    try {
      const { page = 1, limit = 10, search = '', role = '' } = options;

      // Build query
      const query = {};
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (role) {
        query.role = role;
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(query);

      return {
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        },
        message: 'Users retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  /**
     * Update user role (admin only)
     * @param {string} userId - User ID
     * @param {string} newRole - New role
     * @returns {Promise<Object>} Updated user
     */
  async updateUserRole(userId, newRole) {
    try {
      const validRoles = ['user', 'admin', 'moderator'];
      if (!validRoles.includes(newRole)) {
        throw new Error('Invalid role');
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role: newRole, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: updatedUser,
        message: 'User role updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  }

  /**
     * Deactivate user (admin only)
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Success message
     */
  async deactivateUser(userId) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return {
        success: true,
        message: 'User deactivated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to deactivate user: ${error.message}`);
    }
  }

  /**
     * Activate user (admin only)
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Success message
     */
  async activateUser(userId) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { isActive: true, updatedAt: new Date() },
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return {
        success: true,
        message: 'User activated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to activate user: ${error.message}`);
    }
  }
}

module.exports = new UserService();
