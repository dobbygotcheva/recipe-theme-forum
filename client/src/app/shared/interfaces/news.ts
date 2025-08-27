export interface News {
    _id: string;
    title: string;
    content: string;
    summary?: string;
    image?: string;
    author: {
        _id: string;
        username: string;
    };
    status: 'draft' | 'published' | 'archived';
    tags?: string[];
    created_at: string;
    updated_at?: string;
    published_at?: string;
    views?: number;
    featured?: boolean;
}
