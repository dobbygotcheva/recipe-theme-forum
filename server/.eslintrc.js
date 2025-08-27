module.exports = {
    env: {
        node: true,
        es2021: true,
        commonjs: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:node/recommended',
        'plugin:security/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
    },
    rules: {
        // Code quality
        'no-unused-vars': 'error',
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-alert': 'error',
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-script-url': 'error',

        // Best practices
        'eqeqeq': 'error',
        'curly': 'error',
        'no-duplicate-imports': 'error',
        'no-unreachable': 'error',
        'no-unused-expressions': 'error',
        'no-constant-condition': 'error',
        'no-empty': 'error',
        'no-extra-semi': 'error',
        'no-irregular-whitespace': 'error',
        'no-multiple-empty-lines': ['error', { max: 2 }],
        'no-trailing-spaces': 'error',

        // Formatting
        'semi': ['error', 'always'],
        'quotes': ['error', 'single', { avoidEscape: true }],
        'indent': ['error', 2],
        'comma-dangle': ['error', 'never'],
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],
        'space-before-function-paren': ['error', 'never'],
        'space-before-blocks': 'error',
        'keyword-spacing': 'error',
        'space-infix-ops': 'error',
        'arrow-spacing': 'error',

        // Security
        'security/detect-object-injection': 'warn',
        'security/detect-non-literal-regexp': 'warn',
        'security/detect-unsafe-regex': 'warn',

        // Node.js specific
        'node/no-unsupported-features/es-syntax': 'off',
        'node/no-missing-import': 'off',
        'node/no-unpublished-import': 'off',
    },
    plugins: ['security'],
    ignorePatterns: ['node_modules/', 'dist/', 'uploads/'],
};
