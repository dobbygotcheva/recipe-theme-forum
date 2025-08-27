import { Post } from "./post";

export interface Rating {
    _id: string;
    rating: number;
    userId: string;
    username: string;
    created_at: string;
    updatedAt: string;
}

export interface Comment {
    _id: string;
    text: string;
    userId: string;
    username: string;
    likes: string[];
    dislikes: string[];
    parentCommentId?: string;
    replies?: Comment[];
    created_at: string;
    updatedAt: string;
}

// title, category, img,time,ingredients,  text, userId

export interface Theme {
    _id: string;
    title: string;
    category: string;
    img: string;
    time: number;
    ingredients: string;
    text: string;
    // Nutritional information
    protein?: number; // grams
    fats?: number; // grams
    carbs?: number; // grams
    calories?: number; // kcal
    // Video tutorial fields
    videoUrl?: string;
    videoFile?: string;
    videoType?: 'youtube' | 'upload' | null;
    userId: string;
    posts: Post[] | '';
    ratings: Rating[];
    comments: Comment[];
    averageRating: number;
    totalRatings: number;
    created_at: string;
    updatedAt: string;
    _v: number;
    // Like/Dislike functionality
    likes?: string[];
    dislikes?: string[];
}
