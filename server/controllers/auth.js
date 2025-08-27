const { users, tokens, saveUsers } = require('../config/db-simple');

const utils = require('../utils');
const { authCookieName } = require('../app-config');

const bsonToJson = (data) => { return JSON.parse(JSON.stringify(data)) };
const removePassword = (data) => {
    const { password, __v, ...userData } = data;
    return userData
}

function register(req, res, next) {
    try {
        const { email, username, password, repeatPassword } = req.body;

        // Check if user already exists
        const existingUser = Array.from(users.values()).find(user =>
            user.email === email || user.username === username
        );

        if (existingUser) {
            res.status(409).send({ message: "This email or username is already registered!" });
            return;
        }

        const userId = Date.now().toString();
        const createdUser = {
            _id: userId,
            email,
            username,
            password, // In a real app, this should be hashed
            posts: [],
            themes: [],
            role: 'user', // Default role for new users
            created_at: new Date()
        };

        users.set(userId, createdUser);

        // Save users to persistent storage
        saveUsers();

        console.log(`✅ User registered successfully: ${username} (${email})`);

        // Return success message instead of auto-login
        res.status(201).json({
            message: 'Registration successful! Please log in with your credentials.',
            user: {
                _id: userId,
                username,
                email,
                role: 'user'
            }
        });
    } catch (error) {
        next(error);
    }
}

function login(req, res, next) {
    try {
        console.log('=== LOGIN DEBUG ===');
        console.log('Login request received');
        console.log('Request body:', req.body);
        console.log('Request headers:', req.headers);

        const { email, password } = req.body;
        console.log('Extracted credentials:', { email, password });

        // Find user by email
        const user = Array.from(users.values()).find(u => u.email === email);
        console.log('Found user:', user ? 'Yes' : 'No');

        if (!user || user.password !== password) { // In a real app, use proper password hashing
            console.log('Login failed: Invalid credentials');
            res.status(401).send({ message: 'Wrong email or password' });
            return;
        }

        const userData = removePassword(user);
        const token = utils.jwt.createToken({ id: userData._id });
        console.log('Login successful, token created');

        // Set cookie with proper configuration
        res.cookie(authCookieName, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/'
        });

        console.log('Cookie set, sending response');
        res.status(200).send(userData);
    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
}

function logout(req, res) {
    try {
        const token = req.cookies[authCookieName];

        // Add token to blacklist
        if (token) {
            tokens.set(token, { token, created_at: new Date() });
        }

        // Clear cookie with same configuration as when setting
        res.clearCookie(authCookieName, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/'
        });

        res.status(204).send({ message: 'Logged out!' });
    } catch (error) {
        res.status(500).send(error);
    }
}

function getProfileInfo(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { _id: userId } = req.user;

        const user = users.get(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const userData = removePassword(user);
        res.status(200).json(userData);
    } catch (error) {
        next(error);
    }
}

function editProfileInfo(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { _id: userId } = req.user;
        const { username, email, bio, phone, preferences } = req.body;

        const user = users.get(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Only update fields that are provided
        if (username !== undefined) user.username = username;
        if (email !== undefined) user.email = email;
        if (bio !== undefined) user.bio = bio;
        if (phone !== undefined) user.phone = phone;
        if (preferences !== undefined) user.preferences = preferences;

        users.set(userId, user);

        // Save the updated user data to persistent storage
        const { saveUsers } = require('../config/db-simple');
        saveUsers();

        console.log(`✅ Profile updated and saved for user ${userId}`);

        const userData = removePassword(user);
        res.status(200).json(userData);
    } catch (error) {
        next(error);
    }
}

function changePassword(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { _id: userId } = req.user;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400).json({ message: "Current password and new password are required" });
            return;
        }

        const user = users.get(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (user.password !== currentPassword) { // In a real app, use proper password hashing
            res.status(401).json({ message: "Current password is incorrect" });
            return;
        }

        user.password = newPassword;
        users.set(userId, user);

        // Save the updated user data to persistent storage
        const { saveUsers } = require('../config/db-simple');
        saveUsers();

        console.log(`✅ Password changed and saved for user ${userId}`);

        const { password, ...userData } = user;
        res.status(200).json({ message: "Password changed successfully", user: userData });
    } catch (error) {
        next(error);
    }
}

function uploadAvatar(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { _id: userId } = req.user;

        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }

        const avatarUrl = `/uploads/${req.file.filename}`;

        const user = users.get(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        user.avatar = avatarUrl;
        users.set(userId, user);

        // Save the updated user data to persistent storage
        const { saveUsers } = require('../config/db-simple');
        saveUsers();

        console.log(`✅ Avatar uploaded and saved for user ${userId}: ${avatarUrl}`);

        const userData = removePassword(user);
        res.status(200).json({
            message: "Avatar uploaded successfully",
            avatar: avatarUrl,
            user: userData
        });
    } catch (error) {
        console.error('❌ Error uploading avatar:', error);
        next(error);
    }
}

function deleteAccount(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { _id: userId } = req.user;
        const { password } = req.body;

        if (!password) {
            res.status(400).json({ message: "Password is required to delete account" });
            return;
        }

        const user = users.get(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (user.password !== password) { // In a real app, use proper password hashing
            res.status(401).json({ message: "Password is incorrect" });
            return;
        }

        // Remove user from users collection
        users.delete(userId);

        // Save the updated users collection to persistent storage
        const { saveUsers } = require('../config/db-simple');
        saveUsers();

        console.log(`✅ Account deleted and saved for user ${userId}`);

        // Clear the auth cookie
        res.clearCookie(require('../app-config').authCookieName, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/'
        });

        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    login,
    register,
    logout,
    getProfileInfo,
    editProfileInfo,
    changePassword,
    uploadAvatar,
    deleteAccount,
}