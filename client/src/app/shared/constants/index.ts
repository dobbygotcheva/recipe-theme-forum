// Application constants
export const APP_CONFIG = {
    name: 'Бързо, лесно и вкусно за злоядковци',
    version: '1.0.0',
    description: 'Recipe sharing platform for picky eaters',
    author: 'Theme Forum Team'
};

// API endpoints
export const API_ENDPOINTS = {
    // Authentication
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',

    // Users
    USERS: '/api/users',
    USER_PROFILE: '/api/users/profile',
    USER_AVATAR: '/api/users/avatar',

    // Themes/Recipes
    THEMES: '/api/themes',
    THEME_BY_ID: (id: string) => `/api/themes/${id}`,
    THEME_LIKE: (id: string) => `/api/themes/${id}/like`,
    THEME_DISLIKE: (id: string) => `/api/themes/${id}/dislike`,
    THEME_RATE: (id: string) => `/api/themes/${id}/rate`,

    // Comments
    COMMENTS: '/api/comments',
    COMMENT_BY_ID: (id: string) => `/api/comments/${id}`,
    THEME_COMMENTS: (themeId: string) => `/api/themes/${themeId}/comments`,

    // News
    NEWS: '/api/news',
    NEWS_BY_ID: (id: string) => `/api/news/${id}`,

    // Courses
    COURSES: '/api/courses',
    COURSE_SCHEDULES: '/api/course-schedules',
    ENROLLMENTS: '/api/enrollments',

    // Admin
    ADMIN_USERS: '/api/admin/users',
    ADMIN_THEMES: '/api/admin/themes',
    ADMIN_NEWS: '/api/admin/news',
    ADMIN_STATS: '/api/admin/stats',

    // Other
    LOTTERY: '/api/lottery',
    CONTACT: '/api/contact',
    NOTIFICATIONS: '/api/notifications',
    FAVORITES: '/api/favorites',
    UPLOAD: '/api/upload'
};

// HTTP status codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

// Form validation rules
export const VALIDATION_RULES = {
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 30,
        PATTERN: /^[a-zA-Z0-9_-]+$/
    },
    PASSWORD: {
        MIN_LENGTH: 6,
        PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    },
    EMAIL: {
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    TITLE: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 200
    },
    CONTENT: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 5000
    },
    INGREDIENTS: {
        MIN_COUNT: 1,
        MAX_COUNT: 50
    },
    INSTRUCTIONS: {
        MIN_COUNT: 1,
        MAX_COUNT: 100
    }
};

// Recipe categories
export const RECIPE_CATEGORIES = [
    'Закуски',
    'Супи',
    'Основни ястия',
    'Салати',
    'Десерти',
    'Напитки',
    'Хлебни изделия',
    'Консервиране',
    'Други'
] as const;

// Recipe difficulty levels
export const DIFFICULTY_LEVELS = [
    { value: 'easy', label: 'Лесно', color: 'success' },
    { value: 'medium', label: 'Средно', color: 'warning' },
    { value: 'hard', label: 'Трудно', color: 'danger' }
] as const;

// Cooking time ranges
export const COOKING_TIME_RANGES = [
    { value: 15, label: '15 мин' },
    { value: 30, label: '30 мин' },
    { value: 45, label: '45 мин' },
    { value: 60, label: '1 час' },
    { value: 90, label: '1.5 часа' },
    { value: 120, label: '2 часа' },
    { value: 180, label: '3+ часа' }
];

// Serving sizes
export const SERVING_SIZES = [
    { value: 1, label: '1 порция' },
    { value: 2, label: '2 порции' },
    { value: 4, label: '4 порции' },
    { value: 6, label: '6 порции' },
    { value: 8, label: '8 порции' },
    { value: 10, label: '10+ порции' }
];

// File upload limits
export const FILE_LIMITS = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    MAX_FILES: 1
};

// Pagination defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 100
};

// Local storage keys
export const STORAGE_KEYS = {
    USER_TOKEN: 'user_token',
    USER_DATA: 'user_data',
    THEME_FILTERS: 'theme_filters',
    USER_PREFERENCES: 'user_preferences',
    CART_ITEMS: 'cart_items'
};

// Notification types
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
} as const;

// User roles
export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin'
} as const;

// Theme statuses
export const THEME_STATUSES = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
} as const;

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Грешка в мрежата. Моля, проверете връзката.',
    UNAUTHORIZED: 'Не сте оторизиран за тази операция.',
    FORBIDDEN: 'Нямате права за достъп до този ресурс.',
    NOT_FOUND: 'Заявеният ресурс не е намерен.',
    VALIDATION_ERROR: 'Моля, проверете въведените данни.',
    SERVER_ERROR: 'Възникна грешка в сървъра. Моля, опитайте по-късно.',
    FILE_TOO_LARGE: 'Файлът е твърде голям. Максималният размер е 5MB.',
    INVALID_FILE_TYPE: 'Невалиден тип файл. Разрешени са само изображения.',
    RATE_LIMIT_EXCEEDED: 'Превишихте лимита за заявки. Моля, опитайте по-късно.'
};

// Success messages
export const SUCCESS_MESSAGES = {
    THEME_CREATED: 'Рецептата е създадена успешно!',
    THEME_UPDATED: 'Рецептата е обновена успешно!',
    THEME_DELETED: 'Рецептата е изтрита успешно!',
    COMMENT_ADDED: 'Коментарът е добавен успешно!',
    RATING_ADDED: 'Оценката е добавена успешно!',
    PROFILE_UPDATED: 'Профилът е обновен успешно!',
    PASSWORD_CHANGED: 'Паролата е променена успешно!',
    LOGIN_SUCCESS: 'Успешно влизане в системата!',
    REGISTRATION_SUCCESS: 'Регистрацията е успешна!',
    LOGOUT_SUCCESS: 'Успешно излизане от системата!'
};

// Animation durations
export const ANIMATION_DURATIONS = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
    XS: 0,
    SM: 576,
    MD: 768,
    LG: 992,
    XL: 1200,
    XXL: 1400
};

// Color scheme
export const COLORS = {
    PRIMARY: '#3f51b5',
    SECONDARY: '#ff4081',
    SUCCESS: '#4caf50',
    WARNING: '#ff9800',
    ERROR: '#f44336',
    INFO: '#2196f3',
    LIGHT: '#f5f5f5',
    DARK: '#212121',
    WHITE: '#ffffff',
    BLACK: '#000000'
};
