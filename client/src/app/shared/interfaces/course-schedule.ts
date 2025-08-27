export interface CourseSchedule {
    _id: string;
    title: string;
    description: string;
    weekStartDate: string; // ISO date string for the start of the week
    weekEndDate: string;   // ISO date string for the end of the week
    courses: WeeklyCourse[];
    maxParticipants?: number;
    price?: number;
    instructorId: string;
    instructorName: string;
    status: 'draft' | 'published' | 'completed' | 'cancelled';
    created_at: string;
    updatedAt: string;
    _v: number;
}

export interface WeeklyCourse {
    _id: string;
    dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
    title: string;
    description: string;
    recipeId?: string; // Reference to a theme/recipe
    recipeTitle?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number; // in minutes
    maxParticipants?: number;
    materials?: string[];
    notes?: string;
}

export interface CourseEnrollment {
    _id: string;
    courseScheduleId: string;
    userId: string;
    username: string;
    enrolledAt: string;
    status: 'enrolled' | 'completed' | 'dropped';
    attendance: boolean[];
    _v: number;
}
