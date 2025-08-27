const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT configuration
const JWT_CONFIG = {
  ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'your-access-secret-key',
  REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  ACCESS_TOKEN_EXPIRY: '15m', // 15 minutes
  REFRESH_TOKEN_EXPIRY: '7d', // 7 days
  REFRESH_TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000,
  ISSUER: 'theme-forum-app',
  AUDIENCE: 'theme-forum-users'
};

// Token blacklist (in production, use Redis or database)
const tokenBlacklist = new Set();
const refreshTokenBlacklist = new Set();

/**
 * Generate access token
 * @param {Object} payload - Token payload
 * @param {string} payload.id - User ID
 * @param {string} payload.role - User role
 * @returns {string} JWT access token
 */
function generateAccessToken(payload) {
  try {
    const token = jwt.sign(
      {
        id: payload.id,
        role: payload.role,
        type: 'access',
        jti: crypto.randomBytes(16).toString('hex') // Unique token ID
      },
      JWT_CONFIG.ACCESS_TOKEN_SECRET,
      {
        expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
        algorithm: 'HS256'
      }
    );

    return token;
  } catch (error) {
    console.error('Access token generation error:', error);
    throw new Error('Failed to generate access token');
  }
}

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @param {string} payload.id - User ID
 * @returns {string} JWT refresh token
 */
function generateRefreshToken(payload) {
  try {
    const token = jwt.sign(
      {
        id: payload.id,
        type: 'refresh',
        jti: crypto.randomBytes(16).toString('hex') // Unique token ID
      },
      JWT_CONFIG.REFRESH_TOKEN_SECRET,
      {
        expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
        algorithm: 'HS256'
      }
    );

    return token;
  } catch (error) {
    console.error('Refresh token generation error:', error);
    throw new Error('Failed to generate refresh token');
  }
}

/**
 * Generate both access and refresh tokens
 * @param {Object} payload - Token payload
 * @returns {Object} Object containing access and refresh tokens
 */
function generateTokenPair(payload) {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY
  };
}

/**
 * Verify access token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.ACCESS_TOKEN_SECRET, {
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
      algorithms: ['HS256']
    });

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      throw new Error('Token has been revoked');
    }

    // Verify token type
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    }
    throw error;
  }
}

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object} Decoded token payload
 */
function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.REFRESH_TOKEN_SECRET, {
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
      algorithms: ['HS256']
    });

    // Check if token is blacklisted
    if (refreshTokenBlacklist.has(token)) {
      throw new Error('Refresh token has been revoked');
    }

    // Verify token type
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Valid refresh token
 * @param {Object} user - User object
 * @returns {Object} New token pair
 */
function refreshAccessToken(refreshToken, user) {
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if user still exists and is active
    if (!user || user._id !== decoded.id) {
      throw new Error('User not found or inactive');
    }

    // Generate new token pair
    const newTokens = generateTokenPair({
      id: user._id,
      role: user.role
    });

    // Blacklist old refresh token
    blacklistRefreshToken(refreshToken);

    return newTokens;
  } catch (error) {
    throw error;
  }
}

/**
 * Blacklist an access token
 * @param {string} token - Token to blacklist
 */
function blacklistAccessToken(token) {
  try {
    // Decode token to get expiration
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const expiresAt = decoded.exp * 1000; // Convert to milliseconds
      const now = Date.now();

      // Only blacklist if token hasn't expired
      if (expiresAt > now) {
        tokenBlacklist.add(token);

        // Remove from blacklist after expiration
        setTimeout(() => {
          tokenBlacklist.delete(token);
        }, expiresAt - now);
      }
    }
  } catch (error) {
    console.error('Error blacklisting access token:', error);
  }
}

/**
 * Blacklist a refresh token
 * @param {string} token - Refresh token to blacklist
 */
function blacklistRefreshToken(token) {
  try {
    // Decode token to get expiration
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const expiresAt = decoded.exp * 1000; // Convert to milliseconds
      const now = Date.now();

      // Only blacklist if token hasn't expired
      if (expiresAt > now) {
        refreshTokenBlacklist.add(token);

        // Remove from blacklist after expiration
        setTimeout(() => {
          refreshTokenBlacklist.delete(token);
        }, expiresAt - now);
      }
    }
  } catch (error) {
    console.error('Error blacklisting refresh token:', error);
  }
}

/**
 * Blacklist all user tokens (logout)
 * @param {string} userId - User ID
 * @param {Array} userTokens - Array of user's active tokens
 */
function blacklistUserTokens(userId, userTokens = []) {
  try {
    // Blacklist all user's active tokens
    userTokens.forEach(token => {
      blacklistAccessToken(token);
    });

    console.log(`Blacklisted ${userTokens.length} tokens for user ${userId}`);
  } catch (error) {
    console.error('Error blacklisting user tokens:', error);
  }
}

/**
 * Get token information without verification
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token or null if invalid
 */
function getTokenInfo(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
function isTokenExpired(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {return true;}

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch (error) {
    return true;
  }
}

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date or null if invalid
 */
function getTokenExpiration(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {return null;}

    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
}

/**
 * Generate secure random token
 * @param {number} length - Token length (default: 32)
 * @returns {string} Random token
 */
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash token for storage
 * @param {string} token - Plain token
 * @returns {string} Hashed token
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Get blacklist statistics
 * @returns {Object} Blacklist statistics
 */
function getBlacklistStats() {
  return {
    accessTokens: tokenBlacklist.size,
    refreshTokens: refreshTokenBlacklist.size,
    total: tokenBlacklist.size + refreshTokenBlacklist.size
  };
}

/**
 * Clear expired tokens from blacklist
 */
function cleanupBlacklist() {
  const now = Date.now();

  // Cleanup access tokens
  for (const token of tokenBlacklist) {
    if (isTokenExpired(token)) {
      tokenBlacklist.delete(token);
    }
  }

  // Cleanup refresh tokens
  for (const token of refreshTokenBlacklist) {
    if (isTokenExpired(token)) {
      refreshTokenBlacklist.delete(token);
    }
  }

  console.log('Blacklist cleanup completed');
}

// Periodic cleanup of expired tokens
setInterval(cleanupBlacklist, 60 * 60 * 1000); // Run every hour

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  refreshAccessToken,
  blacklistAccessToken,
  blacklistRefreshToken,
  blacklistUserTokens,
  getTokenInfo,
  isTokenExpired,
  getTokenExpiration,
  generateSecureToken,
  hashToken,
  getBlacklistStats,
  cleanupBlacklist,
  JWT_CONFIG
};
