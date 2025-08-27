const { users, themes, posts } = require('../config/db-simple');
const { auth } = require('../utils');

// Admin middleware to check if user is admin
function adminAuth() {
    return function (req, res, next) {
        console.log('🔒 adminAuth middleware called');
        console.log('🔒 req.user:', req.user);
        console.log('🔒 req.user?.role:', req.user?.role);

        if (!req.user) {
            console.log('❌ No user in request');
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        if (req.user.role !== 'admin') {
            console.log('❌ User is not admin, role:', req.user.role);
            res.status(403).json({ message: "Admin access required" });
            return;
        }

        console.log('✅ Admin auth passed for user:', req.user.username);
        next();
    };
}

// Get admin dashboard statistics
function getStats(req, res, next) {
    try {
        const totalUsers = users.size;
        const totalThemes = themes.size;
        const totalPosts = posts.size;
        const pendingModeration = Array.from(themes.values()).filter(theme =>
            !theme.status || theme.status === 'pending'
        ).length;

        // Get news statistics
        const newsController = require('./newsController');
        const news = newsController.news || new Map();
        const totalNews = news.size;
        const publishedNews = Array.from(news.values()).filter(article =>
            article.status === 'published'
        ).length;

        // Get contact message statistics
        const contactController = require('./contactController');
        const contactMessages = contactController.getContactMessages();
        const totalContactMessages = contactMessages.length;
        const newContactMessages = contactMessages.filter(m => m.status === 'new').length;

        res.json({
            totalUsers,
            totalThemes,
            totalPosts,
            pendingModeration,
            totalNews,
            publishedNews,
            totalContactMessages,
            newContactMessages
        });
    } catch (error) {
        next(error);
    }
}

// Get recent activity
function getActivity(req, res, next) {
    try {
        const allThemes = Array.from(themes.values());
        const recentThemes = allThemes
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10)
            .map(theme => ({
                type: 'theme_created',
                description: `New recipe "${theme.title}" was created`,
                timestamp: theme.created_at,
                icon: 'restaurant_menu'
            }));

        const allUsers = Array.from(users.values());
        const recentUsers = allUsers
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5)
            .map(user => ({
                type: 'user_registered',
                description: `New user "${user.username}" registered`,
                timestamp: user.created_at,
                icon: 'person_add'
            }));

        const activity = [...recentThemes, ...recentUsers]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        res.json(activity);
    } catch (error) {
        next(error);
    }
}

// Get all users for admin management
function getAllUsers(req, res, next) {
    try {
        const usersArray = Array.from(users.values()).map(user => {
            const { password, ...userData } = user;
            
            // Ensure all required fields are present
            const sanitizedUser = {
                _id: userData._id || 'Unknown ID',
                username: userData.username || 'Unknown Username',
                email: userData.email || 'No Email',
                role: userData.role || 'user',
                created_at: userData.created_at || new Date(),
                posts: userData.posts || [],
                themes: userData.themes || [],
                favorites: userData.favorites || [],
                avatar: userData.avatar || null
            };
            
            return sanitizedUser;
        });
        
        console.log(`✅ Admin: Retrieved ${usersArray.length} users`);
        res.json(usersArray);
    } catch (error) {
        console.error('❌ Error in getAllUsers:', error);
        next(error);
    }
}

// Get detailed user information for admin
function getUserDetails(req, res, next) {
    try {
        const { userId } = req.params;
        
        const user = users.get(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Get user's themes
        const userThemes = Array.from(themes.values()).filter(theme => theme.userId === userId);
        
        // Get user's posts
        const userPosts = Array.from(posts.values()).filter(post => post.userId === userId);
        
        // Get user's enrollments
        const { getEnrollments } = require('../router/enrollments');
        const allEnrollments = getEnrollments();
        const userEnrollments = allEnrollments.filter(enrollment => enrollment.userId === userId);
        
        const userDetails = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            avatar: user.avatar,
            stats: {
                totalThemes: userThemes.length,
                totalPosts: userPosts.length,
                totalEnrollments: userEnrollments.length
            },
            themes: userThemes.map(theme => ({
                _id: theme._id,
                title: theme.title,
                status: theme.status,
                created_at: theme.created_at
            })),
            posts: userPosts.map(post => ({
                _id: post._id,
                content: post.content.substring(0, 100) + '...',
                created_at: post.created_at
            })),
            enrollments: userEnrollments.map(enrollment => ({
                _id: enrollment._id,
                courseId: enrollment.courseId,
                courseTitle: enrollment.courseTitle || 'Unknown Course',
                enrolledAt: enrollment.enrolledAt,
                status: enrollment.status
            }))
        };
        
        console.log(`✅ Admin: Retrieved detailed info for user ${userId}`);
        res.json(userDetails);
    } catch (error) {
        console.error('❌ Error in getUserDetails:', error);
        next(error);
    }
}

// Update user role
function updateUserRole(req, res, next) {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['admin', 'user'].includes(role)) {
            res.status(400).json({ message: "Invalid role" });
            return;
        }

        const user = users.get(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        user.role = role;
        users.set(userId, user);

        // Save the updated user data to persistent storage
        const { saveUsers } = require('../config/db-simple');
        saveUsers();

        console.log(`✅ User role updated and saved for user ${userId}: ${role}`);

        const { password, ...userData } = user;
        res.json(userData);
    } catch (error) {
        next(error);
    }
}

// Delete user
function deleteUser(req, res, next) {
    try {
        const { userId } = req.params;

        const user = users.get(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Don't allow admin to delete themselves
        if (userId === req.user._id) {
            res.status(400).json({ message: "Cannot delete your own account" });
            return;
        }

        users.delete(userId);

        // Save the updated users collection to persistent storage
        const { saveUsers } = require('../config/db-simple');
        saveUsers();

        console.log(`✅ User deleted and saved: ${userId}`);

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        next(error);
    }
}

// Get all themes for moderation
function getAllThemes(req, res, next) {
    try {
        const themesArray = Array.from(themes.values()).map(theme => {
            const author = users.get(theme.userId);
            return {
                ...theme,
                author: author ? { username: author.username, email: author.email } : null,
                status: theme.status || 'pending'
            };
        });
        res.json(themesArray);
    } catch (error) {
        next(error);
    }
}

// Approve theme
function approveTheme(req, res, next) {
    try {
        const { themeId } = req.params;

        const theme = themes.get(themeId);
        if (!theme) {
            res.status(404).json({ message: "Theme not found" });
            return;
        }

        theme.status = 'approved';
        themes.set(themeId, theme);

        // Save to persistent storage
        const { saveThemes } = require('../config/db-simple');
        saveThemes();
        console.log('✅ Theme approved and saved to database');

        res.json(theme);
    } catch (error) {
        next(error);
    }
}

// Reject theme
function rejectTheme(req, res, next) {
    try {
        const { themeId } = req.params;
        const { reason } = req.body;

        const theme = themes.get(themeId);
        if (!theme) {
            res.status(404).json({ message: "Theme not found" });
            return;
        }

        theme.status = 'rejected';
        theme.rejectionReason = reason;
        themes.set(themeId, theme);

        // Save to persistent storage
        const { saveThemes } = require('../config/db-simple');
        saveThemes();
        console.log('✅ Theme rejected and saved to database');

        res.json(theme);
    } catch (error) {
        next(error);
    }
}

// Delete theme (admin can delete any theme)
function deleteTheme(req, res, next) {
    try {
        const { themeId } = req.params;

        const theme = themes.get(themeId);
        if (!theme) {
            res.status(404).json({ message: "Theme not found" });
            return;
        }

        themes.delete(themeId);
        res.json({ message: "Theme deleted successfully" });
    } catch (error) {
        next(error);
    }
}

// Course management methods
function getAllCourses(req, res, next) {
    try {
        const courseScheduleModel = require('../models/courseSchedule');
        const schedules = courseScheduleModel.getAll();

        // Extract individual courses from all schedules
        const allCourses = [];
        schedules.forEach(schedule => {
            if (schedule.courses && Array.isArray(schedule.courses)) {
                schedule.courses.forEach(course => {
                    // Create individual course object with schedule info
                    const individualCourse = {
                        _id: course._id || `${schedule._id}_${course.dayOfWeek}`,
                        title: course.title,
                        description: course.description,
                        day: course.dayOfWeek,
                        time: course.startTime,
                        duration: course.duration,
                        maxStudents: course.maxStudents,
                        status: schedule.status || 'active',
                        scheduleTitle: schedule.title,
                        weekStartDate: schedule.weekStartDate,
                        weekEndDate: schedule.weekEndDate,
                        instructorName: schedule.instructorName
                    };
                    allCourses.push(individualCourse);
                });
            }
        });

        console.log(`✅ Admin: Found ${allCourses.length} courses from ${schedules.length} weekly schedules`);
        res.json({ courses: allCourses });
    } catch (error) {
        console.error('❌ Error in getAllCourses:', error);
        next(error);
    }
}

function createCourse(req, res, next) {
    try {
        const courseSchedules = require('../config/db-simple').courseSchedules;
        const { title, description, day, time, duration, maxStudents } = req.body;

        if (!title || !description || !day || !time) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        const newCourse = {
            _id: Date.now().toString(),
            title,
            description,
            day,
            time,
            duration: duration || 60,
            maxStudents: maxStudents || 10,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        courseSchedules.set(newCourse._id, newCourse);

        // Also create/update course schedule entry for the public courses page
        try {
            const courseScheduleModel = require('../models/courseSchedule');

            // Get current week dates
            const currentDate = new Date();
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6); // Sunday
            weekEnd.setHours(23, 59, 59, 999);

            const weekStartStr = weekStart.toISOString().split('T')[0];
            const weekEndStr = weekEnd.toISOString().split('T')[0];

            // Check if a schedule for this week already exists
            const existingSchedules = courseScheduleModel.getAll();
            let currentSchedule = existingSchedules.find(s =>
                s.weekStartDate === weekStartStr && s.weekEndDate === weekEndStr
            );

            if (!currentSchedule) {
                // Create new weekly schedule
                currentSchedule = {
                    title: `Седмичен график ${weekStartStr} - ${weekEndStr}`,
                    description: 'Седмичен график с готварски курсове',
                    weekStartDate: weekStartStr,
                    weekEndDate: weekEndStr,
                    courses: [],
                    maxParticipants: 50,
                    price: null,
                    instructorId: req.user._id || 'admin',
                    instructorName: req.user.username || 'Admin',
                    status: 'published'
                };
            }

            // Add the new course to the schedule
            const courseEntry = {
                dayOfWeek: day,
                startTime: time,
                endTime: new Date(`2000-01-01T${time}`).getTime() + ((duration || 60) * 60000),
                title: title,
                difficulty: 'beginner',
                description: description,
                maxStudents: maxStudents || 10,
                duration: duration || 60
            };

            // Remove existing course for the same day if it exists
            currentSchedule.courses = currentSchedule.courses.filter(c => c.dayOfWeek !== day);

            // Add new course
            currentSchedule.courses.push(courseEntry);

            if (currentSchedule._id) {
                // Update existing schedule
                courseScheduleModel.update(currentSchedule._id, currentSchedule);
            } else {
                // Create new schedule
                courseScheduleModel.create(currentSchedule);
            }

            console.log('✅ Course schedule updated successfully');
        } catch (scheduleError) {
            console.error('⚠️ Warning: Could not update course schedule:', scheduleError);
            // Don't fail the request if schedule update fails
        }

        res.status(201).json(newCourse);
    } catch (error) {
        next(error);
    }
}

function updateCourse(req, res, next) {
    try {
        const courseSchedules = require('../config/db-simple').courseSchedules;
        const { id } = req.params;
        const updates = req.body;

        const course = courseSchedules.get(id);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }

        const updatedCourse = {
            ...course,
            ...updates,
            updated_at: new Date().toISOString()
        };

        courseSchedules.set(id, updatedCourse);
        res.json(updatedCourse);
    } catch (error) {
        next(error);
    }
}

function deleteCourse(req, res, next) {
    try {
        const courseSchedules = require('../config/db-simple').courseSchedules;
        const { id } = req.params;

        const course = courseSchedules.get(id);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }

        // Also remove from course schedule
        try {
            const courseScheduleModel = require('../models/courseSchedule');
            const schedules = courseScheduleModel.getAll();

            // Find and update schedules that contain this course
            schedules.forEach(schedule => {
                if (schedule.courses && Array.isArray(schedule.courses)) {
                    schedule.courses = schedule.courses.filter(c =>
                        c.title !== course.title || c.dayOfWeek !== course.day
                    );

                    // Update the schedule if courses were removed
                    const originalLength = schedule.courses.length;
                    schedule.courses = schedule.courses.filter(c =>
                        c.title !== course.title || c.dayOfWeek !== course.day
                    );

                    if (schedule.courses.length !== originalLength) {
                        courseScheduleModel.update(schedule._id, schedule);
                    }
                }
            });

            console.log('✅ Course removed from schedule successfully');
        } catch (scheduleError) {
            console.error('⚠️ Warning: Could not update course schedule:', scheduleError);
        }

        courseSchedules.delete(id);
        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        next(error);
    }
}

// Get course enrollments with user details for admin
function getCourseEnrollments(req, res, next) {
    try {
        const { courseId } = req.params;

        // Get enrollments from the enrollments router
        const { getEnrollments } = require('../router/enrollments');
        const enrollments = getEnrollments();

        // Filter enrollments for the specific course
        const courseEnrollments = enrollments.filter(e => e.courseId === courseId);

        // Get user details for each enrollment
        const enrollmentsWithUserDetails = courseEnrollments.map(enrollment => {
            const user = users.get(enrollment.userId);
            return {
                _id: enrollment._id,
                userId: enrollment.userId,
                username: user ? user.username : 'Unknown User',
                email: user ? user.email : 'No email',
                enrolledAt: enrollment.enrolledAt,
                status: enrollment.status
            };
        });

        console.log(`✅ Admin: Found ${enrollmentsWithUserDetails.length} enrollments for course ${courseId}`);
        res.json({ enrollments: enrollmentsWithUserDetails });
    } catch (error) {
        console.error('❌ Error in getCourseEnrollments:', error);
        next(error);
    }
}

// Get all enrollments for all courses (admin overview)
function getAllEnrollments(req, res, next) {
    try {
        const { getEnrollments } = require('../router/enrollments');
        const enrollments = getEnrollments();

        console.log(`🔍 Admin getAllEnrollments: Found ${enrollments.length} raw enrollments`);
        console.log(`🔍 Enrollments data:`, enrollments);

        // Get course information from courseSchedules
        const courseSchedules = require('../config/db-simple').courseSchedules;

        // Get user details for each enrollment
        const enrollmentsWithDetails = enrollments.map(enrollment => {
            const user = users.get(enrollment.userId);
            
            // Find the course within weekly schedules
            let courseTitle = 'Unknown Course';
            let scheduleTitle = 'Unknown Schedule';
            let dayOfWeek = 'Unknown Day';
            let startTime = 'Unknown Time';
            
            if (enrollment.scheduleId && enrollment.courseTitle) {
                // Use the data already attached by the enrollments router
                courseTitle = enrollment.courseTitle;
                scheduleTitle = enrollment.scheduleTitle;
                dayOfWeek = enrollment.dayOfWeek;
                startTime = enrollment.startTime;
            } else {
                // Fallback: try to find course in schedules
                const allSchedules = Array.from(courseSchedules.values());
                for (const schedule of allSchedules) {
                    if (schedule.courses && Array.isArray(schedule.courses)) {
                        for (const course of schedule.courses) {
                            const generatedCourseId = `${schedule._id}_${course.dayOfWeek}`;
                            if (generatedCourseId === enrollment.courseId) {
                                courseTitle = course.title;
                                scheduleTitle = schedule.title;
                                dayOfWeek = course.dayOfWeek;
                                startTime = course.startTime;
                                break;
                            }
                        }
                    }
                }
            }

            // Better user data handling
            let username = 'Unknown User';
            let email = 'No email';
            
            if (user) {
                username = user.username || 'Unknown User';
                email = user.email || 'No email';
            } else {
                console.log(`⚠️ User not found for ID: ${enrollment.userId}`);
                // Try to find user by other means or provide fallback
                username = `User-${enrollment.userId}`;
                email = `user-${enrollment.userId}@unknown.com`;
            }

            const enrollmentDetail = {
                _id: enrollment._id,
                courseId: enrollment.courseId,
                courseTitle: courseTitle,
                scheduleTitle: scheduleTitle,
                dayOfWeek: dayOfWeek,
                startTime: startTime,
                userId: enrollment.userId,
                username: username,
                email: email,
                enrolledAt: enrollment.enrolledAt,
                status: enrollment.status
            };

            console.log(`🔍 Enrollment detail:`, enrollmentDetail);
            return enrollmentDetail;
        });

        console.log(`✅ Admin: Found ${enrollmentsWithDetails.length} total enrollments with details`);
        res.json({ enrollments: enrollmentsWithDetails });
    } catch (error) {
        console.error('❌ Error in getAllEnrollments:', error);
        next(error);
    }
}

module.exports = {
    adminAuth,
    getStats,
    getActivity,
    getAllUsers,
    getUserDetails,
    updateUserRole,
    deleteUser,
    getAllThemes,
    approveTheme,
    rejectTheme,
    deleteTheme,
    getAllCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseEnrollments,
    getAllEnrollments
};
