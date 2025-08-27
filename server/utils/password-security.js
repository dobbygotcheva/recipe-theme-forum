const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Password security configuration
const PASSWORD_CONFIG = {
  SALT_ROUNDS: 12, // Higher rounds = more secure but slower
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
  SPECIAL_CHARS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  COMMON_PASSWORDS: [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    'dragon', 'master', 'football', 'superman', 'trustno1'
  ]
};

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  try {
    const saltRounds = PASSWORD_CONFIG.SALT_ROUNDS;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match
 */
async function comparePassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors
 */
function validatePasswordStrength(password) {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < PASSWORD_CONFIG.MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters long`);
  }
  
  if (password.length > PASSWORD_CONFIG.MAX_LENGTH) {
    errors.push(`Password must be no more than ${PASSWORD_CONFIG.MAX_LENGTH} characters long`);
  }
  
  if (PASSWORD_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (PASSWORD_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (PASSWORD_CONFIG.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (PASSWORD_CONFIG.REQUIRE_SPECIAL_CHARS && !new RegExp(`[${PASSWORD_CONFIG.SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common passwords
  if (PASSWORD_CONFIG.COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password');
  }
  
  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password cannot contain more than 2 consecutive identical characters');
  }
  
  // Check for keyboard patterns
  const keyboardPatterns = ['qwerty', 'asdfgh', 'zxcvbn', '123456', '654321'];
  if (keyboardPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    errors.push('Password contains common keyboard patterns');
  }
  
  // Check for personal information patterns (email, username, etc.)
  if (password.includes('@') || password.includes('.com')) {
    errors.push('Password should not contain email addresses');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    score: calculatePasswordScore(password)
  };
}

/**
 * Calculate password strength score (0-100)
 * @param {string} password - Password to score
 * @returns {number} Password strength score
 */
function calculatePasswordScore(password) {
  let score = 0;
  
  // Length contribution
  score += Math.min(password.length * 4, 25);
  
  // Character variety contribution
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  
  // Complexity contribution
  const uniqueChars = new Set(password).size;
  score += Math.min(uniqueChars * 2, 20);
  
  // Entropy contribution
  const charPool = calculateCharPool(password);
  const entropy = password.length * Math.log2(charPool);
  score += Math.min(entropy / 2, 10);
  
  return Math.min(Math.round(score), 100);
}

/**
 * Calculate character pool size for entropy calculation
 * @param {string} password - Password to analyze
 * @returns {number} Character pool size
 */
function calculateCharPool(password) {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/\d/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 32;
  return pool;
}

/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 16)
 * @param {boolean} includeSpecialChars - Include special characters (default: true)
 * @returns {string} Generated password
 */
function generateSecurePassword(length = 16, includeSpecialChars = true) {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = includeSpecialChars ? PASSWORD_CONFIG.SPECIAL_CHARS : '';
  
  let allChars = lowercase + uppercase + numbers + special;
  let password = '';
  
  // Ensure at least one character from each required category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  if (includeSpecialChars) {
    password += special[Math.floor(Math.random() * special.length)];
  }
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Check if password has been compromised (basic check)
 * @param {string} password - Password to check
 * @returns {boolean} True if password might be compromised
 */
function isPasswordCompromised(password) {
  // This is a basic check - in production, you might want to use
  // services like HaveIBeenPwned API for more comprehensive checking
  
  const compromisedPatterns = [
    /password/i,
    /123456/,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i
  ];
  
  return compromisedPatterns.some(pattern => pattern.test(password));
}

/**
 * Get password strength label
 * @param {number} score - Password score (0-100)
 * @returns {string} Strength label
 */
function getPasswordStrengthLabel(score) {
  if (score >= 80) return 'Very Strong';
  if (score >= 60) return 'Strong';
  if (score >= 40) return 'Medium';
  if (score >= 20) return 'Weak';
  return 'Very Weak';
}

/**
 * Update password with enhanced security
 * @param {string} userId - User ID
 * @param {string} newPassword - New password
 * @param {string} currentPassword - Current password (for verification)
 * @param {string} currentHashedPassword - Current hashed password
 * @returns {Promise<Object>} Update result
 */
async function updatePassword(userId, newPassword, currentPassword, currentHashedPassword) {
  try {
    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, currentHashedPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Validate new password strength
    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Check if new password is same as current
    if (await comparePassword(newPassword, currentHashedPassword)) {
      throw new Error('New password must be different from current password');
    }
    
    // Hash new password
    const newHashedPassword = await hashPassword(newPassword);
    
    return {
      success: true,
      hashedPassword: newHashedPassword,
      strength: {
        score: validation.score,
        label: getPasswordStrengthLabel(validation.score)
      }
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Generate password reset token
 * @returns {string} Reset token
 */
function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash password reset token for storage
 * @param {string} token - Plain reset token
 * @returns {string} Hashed token
 */
function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  calculatePasswordScore,
  generateSecurePassword,
  isPasswordCompromised,
  getPasswordStrengthLabel,
  updatePassword,
  generatePasswordResetToken,
  hashResetToken,
  PASSWORD_CONFIG
};
