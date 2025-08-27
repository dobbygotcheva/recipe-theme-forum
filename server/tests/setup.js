/**
 * Test Setup File
 * Configures Jest test environment and global test utilities
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/theme-forum-test';
process.env.PORT = '3001';

// Global test timeout
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
    // Generate test user data
    generateTestUser: (overrides = {}) => ({
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        ...overrides
    }),

    // Generate test theme data
    generateTestTheme: (overrides = {}) => ({
        title: 'Test Recipe',
        description: 'A delicious test recipe for testing purposes',
        content: 'This is a comprehensive test recipe content with detailed instructions and ingredients.',
        category: 'dinner',
        difficulty: 'medium',
        prepTime: 30,
        cookTime: 45,
        servings: 4,
        ingredients: [
            {
                name: 'Test Ingredient 1',
                amount: 2,
                unit: 'cups',
                notes: 'Fresh and organic'
            }
        ],
        instructions: [
            {
                step: 1,
                description: 'Prepare the test ingredients by washing and chopping them properly.',
                time: 10,
                tips: 'Make sure to use fresh ingredients'
            }
        ],
        ...overrides
    }),

    // Generate test comment data
    generateTestComment: (overrides = {}) => ({
        content: 'This is a test comment for testing purposes.',
        ...overrides
    }),

    // Generate test rating data
    generateTestRating: (overrides = {}) => ({
        rating: 5,
        comment: 'Excellent test recipe!',
        ...overrides
    }),

    // Mock request object
    mockRequest: (overrides = {}) => ({
        body: {},
        params: {},
        query: {},
        headers: {},
        user: null,
        ...overrides
    }),

    // Mock response object
    mockResponse: () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        res.send = jest.fn().mockReturnValue(res);
        res.redirect = jest.fn().mockReturnValue(res);
        res.cookie = jest.fn().mockReturnValue(res);
        res.clearCookie = jest.fn().mockReturnValue(res);
        return res;
    },

    // Mock next function
    mockNext: () => jest.fn(),

    // Generate test JWT token
    generateTestToken: (payload = {}) => {
        const jwt = require('jsonwebtoken');
        const defaultPayload = {
            userId: '507f1f77bcf86cd799439011',
            role: 'user',
            type: 'access',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (15 * 60)
        };

        return jwt.sign({ ...defaultPayload, ...payload }, process.env.JWT_SECRET);
    },

    // Generate test refresh token
    generateTestRefreshToken: (payload = {}) => {
        const jwt = require('jsonwebtoken');
        const defaultPayload = {
            userId: '507f1f77bcf86cd799439011',
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
        };

        return jwt.sign({ ...defaultPayload, ...payload }, process.env.JWT_REFRESH_SECRET);
    },

    // Clean up test data
    cleanupTestData: async () => {
        // This would typically clean up test database
        // For now, just a placeholder
        console.log('Test data cleanup completed');
    },

    // Wait for async operations
    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    // Validate response structure
    validateResponseStructure: (response, expectedFields = []) => {
        expect(response).toHaveProperty('success');
        expect(typeof response.success).toBe('boolean');

        if (response.success) {
            expect(response).toHaveProperty('message');
            expect(typeof response.message).toBe('string');

            if (expectedFields.includes('data')) {
                expect(response).toHaveProperty('data');
            }

            if (expectedFields.includes('pagination')) {
                expect(response).toHaveProperty('pagination');
                expect(response.pagination).toHaveProperty('page');
                expect(response.pagination).toHaveProperty('limit');
                expect(response.pagination).toHaveProperty('total');
                expect(response.pagination).toHaveProperty('totalPages');
            }
        } else {
            expect(response).toHaveProperty('error');
            expect(typeof response.error).toBe('string');
        }
    },

    // Validate error response
    validateErrorResponse: (response, expectedStatus, expectedMessage = null) => {
        expect(response.status).toHaveBeenCalledWith(expectedStatus);
        expect(response.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: expectedMessage || expect.any(String),
                error: expect.any(String)
            })
        );
    },

    // Validate success response
    validateSuccessResponse: (response, expectedStatus, expectedMessage = null) => {
        expect(response.status).toHaveBeenCalledWith(expectedStatus);
        expect(response.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                message: expectedMessage || expect.any(String)
            })
        );
    }
};

// Global beforeAll and afterAll hooks
beforeAll(async () => {
    console.log('Setting up test environment...');

    // Add any global setup here
    // For example, database connection, test data seeding, etc.
});

afterAll(async () => {
    console.log('Cleaning up test environment...');

    // Add any global cleanup here
    // For example, database disconnection, test data cleanup, etc.

    await global.testUtils.cleanupTestData();
});

// Global beforeEach and afterEach hooks
beforeEach(async () => {
    // Reset mocks and test data before each test
    jest.clearAllMocks();
});

afterEach(async () => {
    // Clean up after each test
    // This could include clearing test data, resetting state, etc.
});

// Export test utilities for use in individual test files
module.exports = global.testUtils;
