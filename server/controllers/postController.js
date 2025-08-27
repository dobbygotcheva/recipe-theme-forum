const { users, themes, posts } = require('../config/db-simple');

function newPost(text, userId, themeId) {
    try {
        const postId = Date.now().toString();
        const newPost = {
            _id: postId,
            text,
            userId,
            themeId,
            likes: [],
            created_at: new Date()
        };

        posts.set(postId, newPost);

        // Update user
        const user = users.get(userId);
        if (user) {
            user.posts = user.posts || [];
            user.themes = user.themes || [];
            user.posts.push(postId);
            if (!user.themes.includes(themeId)) {
                user.themes.push(themeId);
            }
            users.set(userId, user);

            // Save the updated user data to persistent storage
            const { saveUsers } = require('../config/db-simple');
            saveUsers();
        }

        // Update theme
        const theme = themes.get(themeId);
        if (theme) {
            theme.posts = theme.posts || [];
            theme.subscribers = theme.subscribers || [];
            theme.posts.push(postId);
            if (!theme.subscribers.includes(userId)) {
                theme.subscribers.push(userId);
            }
            themes.set(themeId, theme);

            // Save the updated theme data to persistent storage
            const { saveThemes } = require('../config/db-simple');
            saveThemes();
        }

        return Promise.resolve([newPost, theme]);
    } catch (error) {
        return Promise.reject(error);
    }
}

function getLatestsPosts(req, res, next) {
    try {
        const limit = Number(req.query.limit) || 0;

        // Convert Map to Array and sort by created_at
        const postsArray = Array.from(posts.values())
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit || posts.size);

        res.status(200).json(postsArray);
    } catch (error) {
        next(error);
    }
}

function createPost(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { themeId } = req.params;
        const { _id: userId } = req.user;
        const { postText } = req.body || '';

        newPost(postText || "", userId, themeId)
            .then(([_, updatedTheme]) => res.status(200).json(updatedTheme))
            .catch(next);
    } catch (error) {
        next(error);
    }
}

function editPost(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { postId } = req.params;
        const { postText } = req.body;
        const { _id: userId } = req.user;

        const post = posts.get(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        if (post.userId !== userId) {
            res.status(401).json({ message: "Not allowed!" });
            return;
        }

        post.text = postText;
        posts.set(postId, post);
        res.status(200).json(post);
    } catch (error) {
        next(error);
    }
}

function deletePost(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { postId, themeId } = req.params;
        const { _id: userId } = req.user;

        const post = posts.get(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        if (post.userId !== userId) {
            res.status(401).json({ message: "Not allowed!" });
            return;
        }

        // Delete post
        posts.delete(postId);

        // Update user
        const user = users.get(userId);
        if (user && user.posts) {
            user.posts = user.posts.filter(id => id !== postId);
            users.set(userId, user);

            // Save the updated user data to persistent storage
            const { saveUsers } = require('../config/db-simple');
            saveUsers();
        }

        // Update theme
        const theme = themes.get(themeId);
        if (theme && theme.posts) {
            theme.posts = theme.posts.filter(id => id !== postId);
            themes.set(themeId, theme);

            // Save the updated theme data to persistent storage
            const { saveThemes } = require('../config/db-simple');
            saveThemes();
        }

        res.status(200).json(post);
    } catch (error) {
        next(error);
    }
}

function like(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { postId } = req.params;
        const { _id: userId } = req.user;

        console.log('like');

        const post = posts.get(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        if (!post.likes.includes(userId)) {
            post.likes.push(userId);
            posts.set(postId, post);
        }

        res.status(200).json({ message: 'Liked successful!' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getLatestsPosts,
    newPost,
    createPost,
    editPost,
    deletePost,
    like,
}