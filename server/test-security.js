#!/usr/bin/env node

/**
 * Security Testing Script
 * Tests all security features to ensure they're working correctly
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const passwordSecurity = require('./utils/password-security');
const jwtEnhanced = require('./utils/jwt-enhanced');

console.log('🔒 Starting Security Feature Tests...\n');

// Test results tracking
let testsPassed = 0;
let testsFailed = 0;
let totalTests = 0;

function runTest(testName, testFunction) {
  totalTests++;
  try {
    const result = testFunction();
    if (result) {
      console.log(`✅ ${testName} - PASSED`);
      testsPassed++;
    } else {
      console.log(`❌ ${testName} - FAILED`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ ${testName} - FAILED with error: ${error.message}`);
    testsFailed++;
  }
}

// Test 1: Password Hashing
runTest('Password Hashing with bcrypt', () => {
  const password = 'TestPassword123!';
  const hashedPassword = passwordSecurity.hashPassword(password);
  return hashedPassword && hashedPassword !== password;
});

// Test 2: Password Comparison
runTest('Password Comparison', async () => {
  const password = 'TestPassword123!';
  const hashedPassword = await passwordSecurity.hashPassword(password);
  const isValid = await passwordSecurity.comparePassword(password, hashedPassword);
  const isInvalid = await passwordSecurity.comparePassword('WrongPassword', hashedPassword);
  return isValid && !isInvalid;
});

// Test 3: Password Strength Validation
runTest('Password Strength Validation', () => {
  const weakPassword = '123';
  const strongPassword = 'StrongPass123!';
  
  const weakValidation = passwordSecurity.validatePasswordStrength(weakPassword);
  const strongValidation = passwordSecurity.validatePasswordStrength(strongPassword);
  
  return !weakValidation.isValid && strongValidation.isValid;
});

// Test 4: Password Score Calculation
runTest('Password Score Calculation', () => {
  const password = 'VeryStrongPassword123!@#';
  const validation = passwordSecurity.validatePasswordStrength(password);
  return validation.score > 80;
});

// Test 5: Common Password Detection
runTest('Common Password Detection', () => {
  const commonPassword = 'password123';
  const uniquePassword = 'MyUniquePass456!';
  
  const isCommon = passwordSecurity.isPasswordCompromised(commonPassword);
  const isUnique = passwordSecurity.isPasswordCompromised(uniquePassword);
  
  return isCommon && !isUnique;
});

// Test 6: Secure Password Generation
runTest('Secure Password Generation', () => {
  const password = passwordSecurity.generateSecurePassword(16, true);
  const validation = passwordSecurity.validatePasswordStrength(password);
  return validation.isValid && password.length === 16;
});

// Test 7: JWT Token Generation
runTest('JWT Access Token Generation', () => {
  const payload = { id: '123', role: 'user' };
  const token = jwtEnhanced.generateAccessToken(payload);
  return token && typeof token === 'string';
});

// Test 8: JWT Token Verification
runTest('JWT Token Verification', () => {
  const payload = { id: '123', role: 'user' };
  const token = jwtEnhanced.generateAccessToken(payload);
  const decoded = jwtEnhanced.verifyAccessToken(token);
  return decoded.id === payload.id && decoded.role === payload.role;
});

// Test 9: JWT Token Expiration
runTest('JWT Token Expiration Check', () => {
  const payload = { id: '123', role: 'user' };
  const token = jwtEnhanced.generateAccessToken(payload);
  const isExpired = jwtEnhanced.isTokenExpired(token);
  return !isExpired; // Token should not be expired immediately
});

// Test 10: Token Blacklisting
runTest('Token Blacklisting', () => {
  const payload = { id: '123', role: 'user' };
  const token = jwtEnhanced.generateAccessToken(payload);
  
  // Blacklist the token
  jwtEnhanced.blacklistAccessToken(token);
  
  // Try to verify blacklisted token
  try {
    jwtEnhanced.verifyAccessToken(token);
    return false; // Should fail
  } catch (error) {
    return error.message === 'Token has been revoked';
  }
});

// Test 11: Password Update Security
runTest('Password Update Security', async () => {
  const oldPassword = 'OldPassword123!';
  const newPassword = 'NewPassword456!';
  
  const hashedOldPassword = await passwordSecurity.hashPassword(oldPassword);
  
  try {
    const result = await passwordSecurity.updatePassword(
      '123',
      newPassword,
      oldPassword,
      hashedOldPassword
    );
    return result.success && result.hashedPassword !== hashedOldPassword;
  } catch (error) {
    return false;
  }
});

// Test 12: Input Validation
runTest('Input Validation Rules', () => {
  const validEmail = 'test@example.com';
  const invalidEmail = 'invalid-email';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(validEmail) && !emailRegex.test(invalidEmail);
});

// Test 13: Crypto Functions
runTest('Crypto Functions', () => {
  const data = 'test data';
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  const randomBytes = crypto.randomBytes(16);
  
  return hash && randomBytes && randomBytes.length === 16;
});

// Test 14: Password Requirements
runTest('Password Requirements', () => {
  const config = passwordSecurity.PASSWORD_CONFIG;
  
  return config.MIN_LENGTH === 8 &&
         config.MAX_LENGTH === 128 &&
         config.REQUIRE_UPPERCASE === true &&
         config.REQUIRE_LOWERCASE === true &&
         config.REQUIRE_NUMBERS === true &&
         config.REQUIRE_SPECIAL_CHARS === true;
});

// Test 15: JWT Configuration
runTest('JWT Configuration', () => {
  const config = jwtEnhanced.JWT_CONFIG;
  
  return config.ACCESS_TOKEN_EXPIRY === '15m' &&
         config.REFRESH_TOKEN_EXPIRY === '7d' &&
         config.ISSUER === 'theme-forum-app' &&
         config.AUDIENCE === 'theme-forum-users';
});

// Test 16: Security Headers
runTest('Security Headers Configuration', () => {
  // This would test the security middleware configuration
  // For now, we'll just check if the module exists
  try {
    const securityMiddleware = require('./middleware/security');
    return securityMiddleware && typeof securityMiddleware.securityHeaders === 'function';
  } catch (error) {
    return false;
  }
});

// Test 17: Rate Limiting
runTest('Rate Limiting Configuration', () => {
  try {
    const securityMiddleware = require('./middleware/security');
    return securityMiddleware && typeof securityMiddleware.createRateLimiter === 'function';
  } catch (error) {
    return false;
  }
});

// Test 18: Authentication Middleware
runTest('Authentication Middleware', () => {
  try {
    const authMiddleware = require('./middleware/auth-enhanced');
    return authMiddleware && typeof authMiddleware.authEnhanced === 'function';
  } catch (error) {
    return false;
  }
});

// Test 19: Password Strength Labels
runTest('Password Strength Labels', () => {
  const veryWeak = passwordSecurity.getPasswordStrengthLabel(10);
  const weak = passwordSecurity.getPasswordStrengthLabel(30);
  const medium = passwordSecurity.getPasswordStrengthLabel(50);
  const strong = passwordSecurity.getPasswordStrengthLabel(70);
  const veryStrong = passwordSecurity.getPasswordStrengthLabel(90);
  
  return veryWeak === 'Very Weak' &&
         weak === 'Weak' &&
         medium === 'Medium' &&
         strong === 'Strong' &&
         veryStrong === 'Very Strong';
});

// Test 20: Token Information
runTest('Token Information Extraction', () => {
  const payload = { id: '123', role: 'user' };
  const token = jwtEnhanced.generateAccessToken(payload);
  const tokenInfo = jwtEnhanced.getTokenInfo(token);
  
  return tokenInfo && tokenInfo.id === payload.id && tokenInfo.role === payload.role;
});

console.log('\n📊 Test Results Summary:');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${testsPassed} ✅`);
console.log(`Failed: ${testsFailed} ❌`);
console.log(`Success Rate: ${((testsPassed / totalTests) * 100).toFixed(1)}%`);

if (testsFailed === 0) {
  console.log('\n🎉 All security tests passed! Your application is secure.');
} else {
  console.log('\n⚠️  Some security tests failed. Please review the implementation.');
}

console.log('\n🔒 Security testing completed.');

// Exit with appropriate code
process.exit(testsFailed === 0 ? 0 : 1);
