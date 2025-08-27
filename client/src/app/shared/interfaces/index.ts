// User related interfaces
export interface User {
    _id: string;
    email: string;
    username: string;
    password?: string;
    posts: string[];
    themes: string[];
    favorites: string[];
    role: 'user' | 'admin';
    created_at: string;
    avatar?: string;
}

export interface UserProfile extends Omit<User, 'password'> {
    bio?: string;
    location?: string;
    website?: string;
}

// Theme/Recipe related interfaces
export interface Theme {
    _id: string;
    title: string;
    content: string;
    image?: string;
    author: string;
    authorName: string;
    likes: string[];
    dislikes: string[];
    comments: Comment[];
    rating: number;
    ratings: Rating[];
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    cookingTime: number;
    servings: number;
    ingredients: string[];
    instructions: string[];
    tags: string[];
    created_at: string;
    updated_at: string;
}

export interface CreateThemeRequest {
    title: string;
    content: string;
    image?: File;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    cookingTime: number;
    servings: number;
    ingredients: string[];
    instructions: string[];
    tags: string[];
}

export interface UpdateThemeRequest extends Partial<CreateThemeRequest> {
    _id: string;
}

// Comment related interfaces
export interface Comment {
    _id: string;
    content: string;
    author: string;
    authorName: string;
    authorAvatar?: string;
    created_at: string;
    likes: string[];
    replies: Comment[];
    parentId?: string;
    level: number;
}

export interface CreateCommentRequest {
    content: string;
    themeId: string;
    parentId?: string;
}

// Rating related interfaces
export interface Rating {
    _id: string;
    value: number;
    user: string;
    userName: string;
    created_at: string;
}

export interface CreateRatingRequest {
    themeId: string;
    value: number;
}

// News related interfaces
export interface News {
    _id: string;
    title: string;
    content: string;
    image?: string;
    author: string;
    authorName: string;
    created_at: string;
    updated_at: string;
    tags: string[];
    category: string;
}

// Course related interfaces
export interface Course {
    _id: string;
    title: string;
    description: string;
    instructor: string;
    instructorName: string;
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    price: number;
    image?: string;
    created_at: string;
}

export interface CourseSchedule {
    _id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    courses: CourseScheduleItem[];
    isPublished: boolean;
    created_at: string;
}

export interface CourseScheduleItem {
    _id: string;
    courseId: string;
    courseTitle: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    instructor: string;
    maxStudents: number;
}

export interface Enrollment {
    _id: string;
    courseId: string;
    userId: string;
    enrolledAt: string;
    status: 'active' | 'completed' | 'cancelled';
    scheduleId: string;
    scheduleTitle: string;
    courseTitle: string;
    dayOfWeek: string;
    startTime: string;
}

// Lottery related interfaces
export interface Lottery {
    _id: string;
    title: string;
    description: string;
    prize: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    participants: string[];
    winner?: string;
    created_at: string;
}

// Contact related interfaces
export interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'unread' | 'read' | 'replied';
    created_at: string;
    adminReply?: string;
    repliedAt?: string;
}

// Notification related interfaces
export interface Notification {
    _id: string;
    userId: string;
    type: 'comment' | 'like' | 'rating' | 'news' | 'system';
    title: string;
    message: string;
    isRead: boolean;
    relatedId?: string;
    created_at: string;
}

// API response interfaces
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Form related interfaces
export interface FormErrors {
    [key: string]: string;
}

export interface FormState {
    isLoading: boolean;
    isSubmitted: boolean;
    errors: FormErrors;
}

// Search and filter interfaces
export interface SearchFilters {
    query?: string;
    category?: string;
    difficulty?: string;
    minRating?: number;
    maxCookingTime?: number;
    tags?: string[];
    sortBy?: 'title' | 'rating' | 'created_at' | 'cookingTime';
    sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
    items: T[];
    total: number;
    filters: SearchFilters;
}

// File upload interfaces
export interface FileUploadResponse {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
}

// Authentication interfaces
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    message: string;
}

// Admin specific interfaces
export interface AdminStats {
    totalUsers: number;
    totalThemes: number;
    totalComments: number;
    totalRatings: number;
    activeEnrollments: number;
    unreadMessages: number;
}

export interface AdminDashboardData {
    stats: AdminStats;
    recentUsers: User[];
    recentThemes: Theme[];
    recentComments: Comment[];
    recentEnrollments: Enrollment[];
}
