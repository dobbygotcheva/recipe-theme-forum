const jwtEnhanced = require('../utils/jwt-enhanced');
const { authCookieName } = require('../app-config');

/**
 * Enhanced authentication middleware
 * @param {boolean} redirectUnauthenticated - Whether to redirect unauthenticated users
 * @param {boolean} requireRole - Specific role requirement
 * @returns {Function} Express middleware function
 */
function authEnhanced(redirectUnauthenticated = true, requireRole = null) {
  return async function (req, res, next) {
    try {
      // Get access token from cookie
      const accessToken = req.cookies[`${authCookieName}_access`];
      const refreshToken = req.cookies[`${authCookieName}_refresh`];
      
      if (!accessToken) {
        if (!redirectUnauthenticated) {
          req.user = null;
          req.isLogged = false;
          req.authLevel = 'none';
          return next();
        }
        
        return res.status(401).json({
          error: 'Authentication required',
          message: 'No access token provided'
        });
      }

      try {
        // Verify access token
        const decoded = jwtEnhanced.verifyAccessToken(accessToken);
        req.user = { _id: decoded.id, role: decoded.role };
        req.isLogged = true;
        req.authLevel = 'access';
        req.tokenInfo = decoded;
        
        // Check role requirement if specified
        if (requireRole && decoded.role !== requireRole) {
          return res.status(403).json({
            error: 'Insufficient permissions',
            message: `Role '${requireRole}' is required`
          });
        }
        
        return next();
        
      } catch (accessTokenError) {
        // If access token is expired, try to refresh it
        if (accessTokenError.message === 'Access token expired' && refreshToken) {
          try {
            // Attempt to refresh the token
            const newTokens = await refreshTokensAndContinue(req, res, next);
            if (newTokens) {
              return; // Middleware will continue with new tokens
            }
          } catch (refreshError) {
            // Refresh failed, clear cookies and return error
            clearAuthCookies(res);
            
            if (!redirectUnauthenticated) {
              req.user = null;
              req.isLogged = false;
              req.authLevel = 'none';
              return next();
            }
            
            return res.status(401).json({
              error: 'Authentication failed',
              message: 'Token refresh failed. Please log in again.'
            });
          }
        }
        
        // Access token is invalid for other reasons
        clearAuthCookies(res);
        
        if (!redirectUnauthenticated) {
          req.user = null;
          req.isLogged = false;
          req.authLevel = 'none';
          return next();
        }
        
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid access token'
        });
      }
      
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      if (!redirectUnauthenticated) {
        req.user = null;
        req.isLogged = false;
        req.authLevel = 'none';
        return next();
      }
      
      return res.status(500).json({
        error: 'Authentication error',
        message: 'Internal server error during authentication'
      });
    }
  };
}

/**
 * Refresh tokens and continue with the request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {boolean} True if refresh was successful
 */
async function refreshTokensAndContinue(req, res, next) {
  try {
    const refreshToken = req.cookies[`${authCookieName}_refresh`];
    
    if (!refreshToken) {
      return false;
    }
    
    // Verify refresh token
    const decoded = jwtEnhanced.verifyRefreshToken(refreshToken);
    
    // Get user data (you might want to fetch this from database)
    const user = {
      _id: decoded.id,
      role: 'user' // You might want to get this from database
    };
    
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
    
    // Set user info and continue
    req.user = { _id: user._id, role: user.role };
    req.isLogged = true;
    req.authLevel = 'refreshed';
    req.tokenInfo = jwtEnhanced.getTokenInfo(newTokenPair.accessToken);
    
    // Continue with the request
    return next();
    
  } catch (error) {
    console.error('Token refresh error in middleware:', error);
    return false;
  }
}

/**
 * Clear authentication cookies
 * @param {Object} res - Express response object
 */
function clearAuthCookies(res) {
  res.clearCookie(`${authCookieName}_access`);
  res.clearCookie(`${authCookieName}_refresh`);
}

/**
 * Role-based access control middleware
 * @param {string|Array} allowedRoles - Role or array of roles allowed
 * @returns {Function} Express middleware function
 */
function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return function (req, res, next) {
    if (!req.user || !req.isLogged) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be logged in'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Roles allowed: ${roles.join(', ')}. Your role: ${req.user.role}`
      });
    }
    
    next();
  };
}

/**
 * Admin-only middleware
 * @returns {Function} Express middleware function
 */
function requireAdmin() {
  return requireRole('admin');
}

/**
 * User or admin middleware
 * @returns {Function} Express middleware function
 */
function requireUserOrAdmin() {
  return requireRole(['user', 'admin']);
}

/**
 * Optional authentication middleware (doesn't fail if no token)
 * @returns {Function} Express middleware function
 */
function optionalAuth() {
  return authEnhanced(false);
}

/**
 * Check if user has specific permission
 * @param {string} permission - Permission to check
 * @returns {Function} Express middleware function
 */
function requirePermission(permission) {
  return function (req, res, next) {
    if (!req.user || !req.isLogged) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be logged in'
      });
    }
    
    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check user-specific permissions (implement based on your permission system)
    const userPermissions = getUserPermissions(req.user._id);
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Permission '${permission}' is required`
      });
    }
    
    next();
  };
}

/**
 * Get user permissions (implement based on your permission system)
 * @param {string} userId - User ID
 * @returns {Array} Array of user permissions
 */
function getUserPermissions(userId) {
  // This is a placeholder - implement based on your permission system
  // You might want to store permissions in the user object or a separate permissions table
  return ['read:own', 'write:own'];
}

/**
 * Rate limiting for authentication endpoints
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function authRateLimit(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress;
  const endpoint = req.path;
  
  // Implement rate limiting logic here
  // You might want to use a library like express-rate-limit
  
  next();
}

/**
 * Log authentication attempts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function logAuthAttempts(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  const timestamp = new Date().toISOString();
  
  // Log authentication attempt
  console.log(`🔐 Auth attempt - IP: ${clientIP}, Path: ${req.path}, Time: ${timestamp}, User-Agent: ${userAgent}`);
  
  next();
}

/**
 * Check if user account is locked
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function checkAccountLock(req, res, next) {
  if (!req.user) {
    return next();
  }
  
  // This would typically check against a database
  // For now, we'll assume the account is not locked
  // Implement based on your account locking system
  
  next();
}

module.exports = {
  authEnhanced,
  requireRole,
  requireAdmin,
  requireUserOrAdmin,
  optionalAuth,
  requirePermission,
  authRateLimit,
  logAuthAttempts,
  checkAccountLock
};
