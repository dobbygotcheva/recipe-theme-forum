import { User } from "./user";
import { Theme } from "./theme";

export interface Post {
    _id:string;
     postText: string;
    likes: User[];
    userId: User;
    themeId: Theme;
    created_at: string;
    updatedAt: string;
    _v:number;
}
