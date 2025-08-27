const { body, param, query, validationResult } = require('express-validator');
const xss = require('xss');
const sqlstring = require('sqlstring');

// Validation schemas for different forms
const validationSchemas = {
    // User registration and authentication
    user: {
        register: [
            body('email')
                .isEmail()
                .normalizeEmail()
                .trim()
                .escape()
                .withMessage('Please provide a valid email address'),

            body('username')
                .isLength({ min: 3, max: 30 })
                .matches(/^[a-zA-Z0-9_-]+$/)
                .trim()
                .escape()
                .withMessage('Username must be 3-30 characters long and contain only letters, numbers, underscores, and hyphens'),

            body('password')
                .isLength({ min: 8, max: 128 })
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])/)
                .withMessage('Password must be 8-128 characters with uppercase, lowercase, number, and special character'),

            body('confirmPassword')
                .custom((value, { req }) => {
                    if (value !== req.body.password) {
                        throw new Error('Password confirmation does not match');
                    }
                    return true;
                })
                .withMessage('Passwords do not match')
        ],

        login: [
            body('email')
                .isEmail()
                .normalizeEmail()
                .trim()
                .escape()
                .withMessage('Please provide a valid email address'),

            body('password')
                .notEmpty()
                .trim()
                .withMessage('Password is required')
        ],

        profile: [
            body('username')
                .optional()
                .isLength({ min: 3, max: 30 })
                .matches(/^[a-zA-Z0-9_-]+$/)
                .trim()
                .escape()
                .withMessage('Username must be 3-30 characters long'),

            body('bio')
                .optional()
                .isLength({ max: 500 })
                .trim()
                .escape()
                .withMessage('Bio must be less than 500 characters'),

            body('location')
                .optional()
                .isLength({ max: 100 })
                .trim()
                .escape()
                .withMessage('Location must be less than 100 characters'),

            body('website')
                .optional()
                .isURL()
                .trim()
                .escape()
                .withMessage('Please provide a valid URL')
        ]
    },

    // Theme/Recipe validation
    theme: {
        create: [
            body('title')
                .isLength({ min: 1, max: 200 })
                .trim()
                .escape()
                .withMessage('Title must be 1-200 characters long'),

            body('content')
                .isLength({ min: 1, max: 5000 })
                .trim()
                .escape()
                .withMessage('Content must be 1-5000 characters long'),

            body('category')
                .isIn(['Закуски', 'Супи', 'Основни ястия', 'Салати', 'Десерти', 'Напитки', 'Хлебни изделия', 'Консервиране', 'Други'])
                .withMessage('Please select a valid category'),

            body('difficulty')
                .isIn(['easy', 'medium', 'hard'])
                .withMessage('Please select a valid difficulty level'),

            body('cookingTime')
                .isInt({ min: 1, max: 480 })
                .withMessage('Cooking time must be between 1 and 480 minutes'),

            body('servings')
                .isInt({ min: 1, max: 50 })
                .withMessage('Servings must be between 1 and 50'),

            body('ingredients')
                .isArray({ min: 1, max: 50 })
                .withMessage('Must provide 1-50 ingredients'),

            body('ingredients.*')
                .isLength({ min: 1, max: 100 })
                .trim()
                .escape()
                .withMessage('Each ingredient must be 1-100 characters long'),

            body('instructions')
                .isArray({ min: 1, max: 100 })
                .withMessage('Must provide 1-100 instructions'),

            body('instructions.*')
                .isLength({ min: 1, max: 500 })
                .trim()
                .escape()
                .withMessage('Each instruction must be 1-500 characters long'),

            body('tags')
                .optional()
                .isArray({ max: 20 })
                .withMessage('Maximum 20 tags allowed'),

            body('tags.*')
                .isLength({ min: 1, max: 30 })
                .trim()
                .escape()
                .withMessage('Each tag must be 1-30 characters long')
        ],

        update: [
            body('title')
                .optional()
                .isLength({ min: 1, max: 200 })
                .trim()
                .escape()
                .withMessage('Title must be 1-200 characters long'),

            body('content')
                .optional()
                .isLength({ min: 1, max: 5000 })
                .trim()
                .escape()
                .withMessage('Content must be 1-5000 characters long'),

            body('category')
                .optional()
                .isIn(['Закуски', 'Супи', 'Основни ястия', 'Салати', 'Десерти', 'Напитки', 'Хлебни изделия', 'Консервиране', 'Други'])
                .withMessage('Please select a valid category'),

            body('difficulty')
                .optional()
                .isIn(['easy', 'medium', 'hard'])
                .withMessage('Please select a valid difficulty level'),

            body('cookingTime')
                .optional()
                .isInt({ min: 1, max: 480 })
                .withMessage('Cooking time must be between 1 and 480 minutes'),

            body('servings')
                .optional()
                .isInt({ min: 1, max: 50 })
                .withMessage('Servings must be between 1 and 50')
        ]
    },

    // Comment validation
    comment: {
        create: [
            body('content')
                .isLength({ min: 1, max: 1000 })
                .trim()
                .escape()
                .withMessage('Comment must be 1-1000 characters long'),

            body('themeId')
                .isMongoId()
                .withMessage('Please provide a valid theme ID'),

            body('parentId')
                .optional()
                .isMongoId()
                .withMessage('Please provide a valid parent comment ID')
        ],

        update: [
            body('content')
                .isLength({ min: 1, max: 1000 })
                .trim()
                .escape()
                .withMessage('Comment must be 1-1000 characters long')
        ]
    },

    // Rating validation
    rating: {
        create: [
            body('themeId')
                .isMongoId()
                .withMessage('Please provide a valid theme ID'),

            body('value')
                .isInt({ min: 1, max: 5 })
                .withMessage('Rating must be between 1 and 5')
        ]
    },

    // Search and filter validation
    search: {
        query: [
            query('q')
                .optional()
                .isLength({ min: 1, max: 100 })
                .trim()
                .escape()
                .withMessage('Search query must be 1-100 characters long'),

            query('category')
                .optional()
                .isIn(['Закуски', 'Супи', 'Основни ястия', 'Салати', 'Десерти', 'Напитки', 'Хлебни изделия', 'Консервиране', 'Други'])
                .withMessage('Invalid category'),

            query('difficulty')
                .optional()
                .isIn(['easy', 'medium', 'hard'])
                .withMessage('Invalid difficulty level'),

            query('minRating')
                .optional()
                .isFloat({ min: 0, max: 5 })
                .withMessage('Minimum rating must be between 0 and 5'),

            query('maxCookingTime')
                .optional()
                .isInt({ min: 1, max: 480 })
                .withMessage('Maximum cooking time must be between 1 and 480 minutes'),

            query('page')
                .optional()
                .isInt({ min: 1, max: 1000 })
                .withMessage('Page must be between 1 and 1000'),

            query('limit')
                .optional()
                .isInt({ min: 1, max: 100 })
                .withMessage('Limit must be between 1 and 100'),

            query('sortBy')
                .optional()
                .isIn(['title', 'rating', 'created_at', 'cookingTime'])
                .withMessage('Invalid sort field'),

            query('sortOrder')
                .optional()
                .isIn(['asc', 'desc'])
                .withMessage('Sort order must be asc or desc')
        ]
    },

    // File upload validation
    fileUpload: {
        image: [
            body('description')
                .optional()
                .isLength({ max: 200 })
                .trim()
                .escape()
                .withMessage('Description must be less than 200 characters')
        ]
    },

    // Admin operations validation
    admin: {
        userManagement: [
            body('userId')
                .isMongoId()
                .withMessage('Please provide a valid user ID'),

            body('action')
                .isIn(['activate', 'deactivate', 'delete', 'changeRole'])
                .withMessage('Invalid action'),

            body('newRole')
                .optional()
                .isIn(['user', 'admin'])
                .withMessage('Invalid role')
        ],

        contentModeration: [
            body('contentId')
                .isMongoId()
                .withMessage('Please provide a valid content ID'),

            body('action')
                .isIn(['approve', 'reject', 'delete', 'flag'])
                .withMessage('Invalid action'),

            body('reason')
                .optional()
                .isLength({ max: 500 })
                .trim()
                .escape()
                .withMessage('Reason must be less than 500 characters')
        ]
    }
};

// Input sanitization functions
const sanitizers = {
    // Remove potentially dangerous characters
    removeDangerousChars: (input) => {
        if (typeof input !== 'string') return input;
        return input
            .replace(/[<>]/g, '') // Remove < and >
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .replace(/data:/gi, ''); // Remove data: protocol
    },

    // Sanitize HTML content
    sanitizeHtml: (input) => {
        if (typeof input !== 'string') return input;
        return xss(input, {
            whiteList: {}, // No HTML allowed
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed']
        });
    },

    // Sanitize SQL input
    sanitizeSql: (input) => {
        if (typeof input !== 'string') return input;
        return sqlstring.escape(input);
    },

    // Sanitize file names
    sanitizeFileName: (filename) => {
        if (typeof filename !== 'string') return filename;
        return filename
            .replace(/[^a-zA-Z0-9._-]/g, '') // Only allow safe characters
            .replace(/\.\./g, '') // Prevent directory traversal
            .substring(0, 255); // Limit length
    },

    // Sanitize email
    sanitizeEmail: (email) => {
        if (typeof email !== 'string') return email;
        return email.toLowerCase().trim();
    },

    // Sanitize username
    sanitizeUsername: (username) => {
        if (typeof username !== 'string') return username;
        return username
            .replace(/[^a-zA-Z0-9_-]/g, '')
            .toLowerCase()
            .trim();
    }
};

// Validation middleware
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            // Apply validation rules
            await Promise.all(schema.map(validation => validation.run(req)));

            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array(),
                    message: 'Please check your input and try again'
                });
            }

            // Sanitize inputs
            sanitizeRequest(req);

            next();
        } catch (error) {
            console.error('Validation error:', error);
            return res.status(500).json({
                error: 'Validation error',
                message: 'An error occurred during validation'
            });
        }
    };
};

// Sanitize request data
const sanitizeRequest = (req) => {
    // Sanitize body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizers.removeDangerousChars(req.body[key]);
            }
        });
    }

    // Sanitize query parameters
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitizers.removeDangerousChars(req.query[key]);
            }
        });
    }

    // Sanitize URL parameters
    if (req.params) {
        Object.keys(req.params).forEach(key => {
            if (typeof req.params[key] === 'string') {
                req.params[key] = sanitizers.removeDangerousChars(req.params[key]);
            }
        });
    }
};

// Custom validation functions
const customValidators = {
    // Check if value is a valid MongoDB ObjectId
    isMongoId: (value) => {
        return /^[0-9a-fA-F]{24}$/.test(value);
    },

    // Check if value is a valid URL
    isValidUrl: (value) => {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    },

    // Check if value contains SQL injection patterns
    hasNoSqlInjection: (value) => {
        if (typeof value !== 'string') return true;

        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
            /(\b(OR|AND)\b\s+\d+\s*[=<>]\s*\d+)/i,
            /(\b(OR|AND)\b\s+['"]?\w+['"]?\s*[=<>]\s*['"]?\w+['"]?)/i,
            /(--|\/\*|\*\/|xp_|sp_)/i,
            /(\b(WAITFOR|DELAY)\b)/i
        ];

        return !sqlPatterns.some(pattern => pattern.test(value));
    },

    // Check if value contains XSS patterns
    hasNoXss: (value) => {
        if (typeof value !== 'string') return true;

        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
            /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
        ];

        return !xssPatterns.some(pattern => pattern.test(value));
    }
};

// Export validation schemas and functions
module.exports = {
    validationSchemas,
    sanitizers,
    validate,
    sanitizeRequest,
    customValidators,

    // Convenience functions for common validations
    validateUser: (action) => validate(validationSchemas.user[action]),
    validateTheme: (action) => validate(validationSchemas.theme[action]),
    validateComment: (action) => validate(validationSchemas.comment[action]),
    validateRating: () => validate(validationSchemas.rating.create),
    validateSearch: () => validate(validationSchemas.search.query),
    validateFileUpload: () => validate(validationSchemas.fileUpload.image),
    validateAdmin: (action) => validate(validationSchemas.admin[action])
};
