const express = require('express');
const router = express.Router();

// Use persistent database storage for enrollments
const { courseSchedules, saveCourseSchedules } = require('../config/db-simple');

// Get enrollments from database or initialize empty array
function getEnrollments() {
    let allEnrollments = [];

    // Get enrollments from courseSchedules database (weekly schedules)
    const allSchedules = Array.from(courseSchedules.values());
    allSchedules.forEach(schedule => {
        if (schedule.courses && Array.isArray(schedule.courses)) {
            schedule.courses.forEach(course => {
                if (course.enrollments && Array.isArray(course.enrollments)) {
                    // Add schedule info to each enrollment
                    course.enrollments.forEach(enrollment => {
                        enrollment.scheduleId = schedule._id;
                        enrollment.scheduleTitle = schedule.title;
                        enrollment.courseTitle = course.title;
                        enrollment.dayOfWeek = course.dayOfWeek;
                        enrollment.startTime = course.startTime;
                    });
                    allEnrollments = allEnrollments.concat(course.enrollments);
                }
            });
        }
    });

    // Also include temporary enrollments from memory
    if (global.tempEnrollments && Array.isArray(global.tempEnrollments)) {
        allEnrollments = allEnrollments.concat(global.tempEnrollments);
    }

    return allEnrollments;
}

// Save enrollments to database
function saveEnrollments() {
    // This will be called after each enrollment change
    saveCourseSchedules();
}

// Enroll in a course
router.post('/enroll', (req, res) => {
    try {
        const { courseId, userId } = req.body;

        if (!courseId || !userId) {
            return res.status(400).json({ error: 'Course ID and User ID are required' });
        }

        console.log(`🔍 Enrollment attempt: courseId=${courseId}, userId=${userId}`);

        // Check if courseSchedules is properly loaded
        if (!courseSchedules || courseSchedules.size === 0) {
            console.error('❌ courseSchedules database is not properly loaded');
            return res.status(500).json({ error: 'Course database not available' });
        }

        // Get all enrollments to check for duplicates
        const allEnrollments = getEnrollments();
        console.log(`🔍 Current enrollments:`, allEnrollments);

        const existingEnrollment = allEnrollments.find(e =>
            e.courseId === courseId && e.userId === userId
        );

        if (existingEnrollment) {
            console.log(`⚠️ User ${userId} already enrolled in course ${courseId}`);
            return res.status(400).json({ error: 'User is already enrolled in this course' });
        }

        // Create new enrollment
        const enrollment = {
            _id: Date.now().toString(),
            courseId,
            userId,
            enrolledAt: new Date().toISOString(),
            status: 'active'
        };

        // Find the course within weekly schedules and add enrollment
        let enrollmentAdded = false;
        const allSchedules = Array.from(courseSchedules.values());
        console.log(`🔍 Searching through ${allSchedules.length} schedules for course ${courseId}`);
        console.log(`🔍 Available schedule IDs:`, allSchedules.map(s => s._id));

        for (const schedule of allSchedules) {
            console.log(`🔍 Checking schedule: ${schedule._id} - ${schedule.title}`);
            if (schedule.courses && Array.isArray(schedule.courses)) {
                console.log(`🔍 Schedule has ${schedule.courses.length} courses`);
                for (const course of schedule.courses) {
                    // Check if this is the course the user wants to enroll in
                    const generatedCourseId = `${schedule._id}_${course.dayOfWeek}`;
                    console.log(`🔍 Generated course ID: ${generatedCourseId} vs requested: ${courseId}`);
                    console.log(`🔍 Course details: ${course.title} - ${course.dayOfWeek}`);

                    if (generatedCourseId === courseId) {
                        console.log(`🎯 Found matching course: ${course.title}`);
                        // Add enrollment to this course
                        if (!course.enrollments) {
                            course.enrollments = [];
                        }
                        course.enrollments.push(enrollment);

                        // Update the schedule in the database
                        courseSchedules.set(schedule._id, schedule);

                        // Save to persistent storage
                        saveEnrollments();
                        console.log(`✅ User ${userId} enrolled in course ${courseId} (${course.title}) and saved to database`);
                        enrollmentAdded = true;
                        break;
                    }
                }
                if (enrollmentAdded) break;
            }
        }

        if (!enrollmentAdded) {
            console.log(`⚠️ Course ${courseId} not found in any schedule, creating enrollment in memory`);
            console.log(`🔍 Available schedules:`, allSchedules.map(s => ({ id: s._id, title: s.title, courses: s.courses?.length || 0 })));
            // Fallback to memory storage if course not found
            if (!global.tempEnrollments) {
                global.tempEnrollments = [];
            }
            global.tempEnrollments.push(enrollment);
            console.log(`📝 Added to temp enrollments. Total temp: ${global.tempEnrollments.length}`);
        }

        res.status(201).json(enrollment);
    } catch (error) {
        console.error('❌ Error enrolling in course:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get user enrollments
router.get('/enrollments/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const allEnrollments = getEnrollments();
        const userEnrollments = allEnrollments.filter(e => e.userId === userId);
        res.json(userEnrollments);
    } catch (error) {
        console.error('Error getting user enrollments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Unenroll from a course
router.delete('/enroll/:courseId/:userId', (req, res) => {
    try {
        const { courseId, userId } = req.params;

        // Find the course within weekly schedules and remove enrollment
        const allSchedules = Array.from(courseSchedules.values());

        for (const schedule of allSchedules) {
            if (schedule.courses && Array.isArray(schedule.courses)) {
                for (const course of schedule.courses) {
                    // Check if this is the course the user wants to unenroll from
                    const generatedCourseId = `${schedule._id}_${course.dayOfWeek}`;
                    if (generatedCourseId === courseId && course.enrollments) {
                        const enrollmentIndex = course.enrollments.findIndex(e => e.userId === userId);

                        if (enrollmentIndex !== -1) {
                            course.enrollments.splice(enrollmentIndex, 1);

                            // Update the schedule in the database
                            courseSchedules.set(schedule._id, schedule);

                            // Save to persistent storage
                            saveEnrollments();
                            console.log(`✅ User ${userId} unenrolled from course ${courseId} (${course.title}) and saved to database`);
                            res.json({ message: 'Successfully unenrolled' });
                            return;
                        }
                    }
                }
            }
        }

        // Fallback to memory storage if course not found
        if (global.tempEnrollments) {
            const enrollmentIndex = global.tempEnrollments.findIndex(e =>
                e.courseId === courseId && e.userId === userId
            );

            if (enrollmentIndex !== -1) {
                global.tempEnrollments.splice(enrollmentIndex, 1);
                console.log(`✅ User ${userId} unenrolled from course ${courseId} from memory`);
                res.json({ message: 'Successfully unenrolled' });
                return;
            }
        }

        res.status(404).json({ error: 'Enrollment not found' });
    } catch (error) {
        console.error('Error unenrolling from course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all enrollments (for admin)
router.get('/', (req, res) => {
    try {
        const allEnrollments = getEnrollments();
        console.log(`🔍 Admin requested all enrollments: ${allEnrollments.length} found`);
        res.json(allEnrollments);
    } catch (error) {
        console.error('Error getting all enrollments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Debug endpoint to see database state
router.get('/debug', (req, res) => {
    try {
        const allSchedules = Array.from(courseSchedules.values());
        const allEnrollments = getEnrollments();
        const tempEnrollments = global.tempEnrollments || [];

        const debugInfo = {
            totalSchedules: allSchedules.length,
            schedules: allSchedules.map(s => ({
                id: s._id,
                title: s.title,
                coursesCount: s.courses?.length || 0,
                courses: s.courses?.map(c => ({
                    title: c.title,
                    dayOfWeek: c.dayOfWeek,
                    enrollmentsCount: c.enrollments?.length || 0,
                    enrollments: c.enrollments || []
                })) || []
            })),
            totalEnrollments: allEnrollments.length,
            enrollments: allEnrollments,
            tempEnrollmentsCount: tempEnrollments.length,
            tempEnrollments: tempEnrollments
        };

        console.log(`🔍 Debug endpoint called. Database state:`, debugInfo);
        res.json(debugInfo);
    } catch (error) {
        console.error('Error in debug endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = { router, getEnrollments, saveEnrollments };
