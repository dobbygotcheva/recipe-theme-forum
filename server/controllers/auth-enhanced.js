const { users, tokens, saveUsers } = require('../config/db-simple');
const passwordSecurity = require('../utils/password-security');
const jwtEnhanced = require('../utils/jwt-enhanced');
const { authCookieName } = require('../app-config');
const { body, validationResult } = require('express-validator');

// Validation rules
const validationRules = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('username')
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username must be 3-30 characters long and contain only letters, numbers, underscores, and hyphens'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      })
      .withMessage('Password confirmation does not match password')
  ],
  
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('confirmNewPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match new password');
        }
        return true;
      })
      .withMessage('Password confirmation does not match new password')
  ]
};

// Helper functions
const bsonToJson = (data) => JSON.parse(JSON.stringify(data));

const removePassword = (data) => {
  const { password, __v, ...userData } = data;
  return userData;
};

const createUserResponse = (user) => {
  const userData = removePassword(user);
  return {
    _id: userData._id,
    email: userData.email,
    username: userData.username,
    role: userData.role,
    created_at: userData.created_at,
    avatar: userData.avatar
  };
};

/**
 * User registration with enhanced security
 */
async function register(req, res, next) {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, username, password, confirmPassword } = req.body;

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(user =>
      user.email === email || user.username === username
    );

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: existingUser.email === email 
          ? 'This email is already registered' 
          : 'This username is already taken'
      });
    }

    // Validate password strength
    const passwordValidation = passwordSecurity.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Password validation failed',
        details: passwordValidation.errors,
        strength: {
          score: passwordValidation.score,
          label: passwordSecurity.getPasswordStrengthLabel(passwordValidation.score)
        }
      });
    }

    // Check if password is compromised
    if (passwordSecurity.isPasswordCompromised(password)) {
      return res.status(400).json({
        error: 'Password security issue',
        message: 'This password is too common or has been compromised. Please choose a stronger password.'
      });
    }

    // Hash password
    const hashedPassword = await passwordSecurity.hashPassword(password);

    // Create user
    const userId = Date.now().toString();
    const createdUser = {
      _id: userId,
      email,
      username,
      password: hashedPassword,
      posts: [],
      themes: [],
      favorites: [],
      role: 'user',
      created_at: new Date(),
      lastLogin: null,
      loginAttempts: 0,
      lockedUntil: null,
      passwordChangedAt: new Date(),
      emailVerified: false,
      twoFactorEnabled: false
    };

    users.set(userId, createdUser);
    saveUsers();

    console.log(`✅ User registered successfully: ${username} (${email})`);

    res.status(201).json({
      message: 'Registration successful! Please log in with your credentials.',
      user: createUserResponse(createdUser),
      passwordStrength: {
        score: passwordValidation.score,
        label: passwordSecurity.getPasswordStrengthLabel(passwordValidation.score)
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
}

/**
 * User login with enhanced security
 */
async function login(req, res, next) {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockedUntil - new Date()) / 1000 / 60);
      return res.status(423).json({
        error: 'Account locked',
        message: `Account is temporarily locked. Please try again in ${remainingTime} minutes.`
      });
    }

    // Verify password
    const isPasswordValid = await passwordSecurity.comparePassword(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
        user.loginAttempts = 0;
        saveUsers();
        
        return res.status(423).json({
          error: 'Account locked',
          message: 'Too many failed login attempts. Account locked for 15 minutes.'
        });
      }
      
      saveUsers();
      
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
        remainingAttempts: 5 - user.loginAttempts
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lastLogin = new Date();
    saveUsers();

    // Generate tokens
    const tokenPair = jwtEnhanced.generateTokenPair({
      id: user._id,
      role: user.role
    });

    // Set secure cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    };

    // Set access token cookie (short-lived)
    res.cookie(`${authCookieName}_access`, tokenPair.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // Set refresh token cookie (long-lived)
    res.cookie(`${authCookieName}_refresh`, tokenPair.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    console.log(`✅ User logged in successfully: ${user.username} (${user.email})`);

    res.status(200).json({
      message: 'Login successful',
      user: createUserResponse(user),
      tokens: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresIn: tokenPair.expiresIn
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
}

/**
 * Refresh access token
 */
async function refreshToken(req, res, next) {
  try {
    const refreshToken = req.cookies[`${authCookieName}_refresh`];
    
    if (!refreshToken) {
      return res.status(401).json({
        error: 'No refresh token provided'
      });
    }

    // Verify refresh token
    const decoded = jwtEnhanced.verifyRefreshToken(refreshToken);
    
    // Get user
    const user = users.get(decoded.id);
    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    // Generate new token pair
    const newTokenPair = jwtEnhanced.refreshAccessToken(refreshToken, user);

    // Set new cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    };

    res.cookie(`${authCookieName}_access`, newTokenPair.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie(`${authCookieName}_refresh`, newTokenPair.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Token refreshed successfully',
      tokens: {
        accessToken: newTokenPair.accessToken,
        refreshToken: newTokenPair.refreshToken,
        expiresIn: newTokenPair.expiresIn
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Clear invalid cookies
    res.clearCookie(`${authCookieName}_access`);
    res.clearCookie(`${authCookieName}_refresh`);
    
    res.status(401).json({
      error: 'Token refresh failed',
      message: error.message
    });
  }
}

/**
 * Change password with enhanced security
 */
async function changePassword(req, res, next) {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Get user
    const user = users.get(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Update password
    const updateResult = await passwordSecurity.updatePassword(
      userId,
      newPassword,
      currentPassword,
      user.password
    );

    // Update user password
    user.password = updateResult.hashedPassword;
    user.passwordChangedAt = new Date();
    saveUsers();

    // Blacklist all user tokens (force re-login)
    jwtEnhanced.blacklistUserTokens(userId);

    // Clear cookies
    res.clearCookie(`${authCookieName}_access`);
    res.clearCookie(`${authCookieName}_refresh`);

    console.log(`✅ Password changed successfully for user: ${user.username}`);

    res.json({
      message: 'Password changed successfully. Please log in again.',
      strength: updateResult.strength
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(400).json({
      error: 'Password change failed',
      message: error.message
    });
  }
}

/**
 * Logout with token blacklisting
 */
async function logout(req, res, next) {
  try {
    const accessToken = req.cookies[`${authCookieName}_access`];
    const refreshToken = req.cookies[`${authCookieName}_refresh`];

    // Blacklist tokens
    if (accessToken) {
      jwtEnhanced.blacklistAccessToken(accessToken);
    }
    if (refreshToken) {
      jwtEnhanced.blacklistRefreshToken(refreshToken);
    }

    // Clear cookies
    res.clearCookie(`${authCookieName}_access`);
    res.clearCookie(`${authCookieName}_refresh`);

    console.log(`✅ User logged out successfully: ${req.user?.username || 'Unknown'}`);

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
}

/**
 * Get current user profile
 */
async function getProfile(req, res, next) {
  try {
    const user = users.get(req.user._id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user: createUserResponse(user)
    });

  } catch (error) {
    console.error('Get profile error:', error);
    next(error);
  }
}

/**
 * Update user profile
 */
async function updateProfile(req, res, next) {
  try {
    const { username, avatar } = req.body;
    const userId = req.user._id;

    const user = users.get(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Check if username is already taken
    if (username && username !== user.username) {
      const existingUser = Array.from(users.values()).find(u => 
        u.username === username && u._id !== userId
      );
      
      if (existingUser) {
        return res.status(409).json({
          error: 'Username already taken'
        });
      }
      
      user.username = username;
    }

    if (avatar) {
      user.avatar = avatar;
    }

    saveUsers();

    console.log(`✅ Profile updated successfully for user: ${user.username}`);

    res.json({
      message: 'Profile updated successfully',
      user: createUserResponse(user)
    });

  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
}

/**
 * Generate secure password suggestion
 */
async function generatePassword(req, res, next) {
  try {
    const { length = 16, includeSpecialChars = true } = req.query;
    
    const password = passwordSecurity.generateSecurePassword(
      parseInt(length),
      includeSpecialChars === 'true'
    );

    const validation = passwordSecurity.validatePasswordStrength(password);

    res.json({
      password,
      strength: {
        score: validation.score,
        label: passwordSecurity.getPasswordStrengthLabel(validation.score)
      }
    });

  } catch (error) {
    console.error('Generate password error:', error);
    next(error);
  }
}

/**
 * Check password strength
 */
async function checkPasswordStrength(req, res, next) {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: 'Password is required'
      });
    }

    const validation = passwordSecurity.validatePasswordStrength(password);
    const isCompromised = passwordSecurity.isPasswordCompromised(password);

    res.json({
      strength: {
        score: validation.score,
        label: passwordSecurity.getPasswordStrengthLabel(validation.score),
        isValid: validation.isValid,
        errors: validation.errors
      },
      security: {
        isCompromised,
        recommendations: isCompromised ? [
          'Avoid common passwords',
          'Use a mix of letters, numbers, and symbols',
          'Make it at least 12 characters long',
          'Avoid personal information'
        ] : []
      }
    });

  } catch (error) {
    console.error('Check password strength error:', error);
    next(error);
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  changePassword,
  logout,
  getProfile,
  updateProfile,
  generatePassword,
  checkPasswordStrength,
  validationRules
};
