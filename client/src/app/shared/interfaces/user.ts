import { Post } from "./post";
import { Theme } from "./theme";

export interface UserPreferences {
    notifications: {
        email: boolean;
        push: boolean;
    };
    privacy: {
        profilePublic: boolean;
        showEmail: boolean;
    };
}

export interface User{
    email: string;
    username: string;
    password: string;
    bio?: string;
    avatar?: string;
    phone?: string;
    preferences?: UserPreferences;
    themes: Theme[];
    posts: Post[];
    _id: string;
    created_at: string;
    updatedAt: string;
    _v: number;
    role?: 'admin' | 'user';
}