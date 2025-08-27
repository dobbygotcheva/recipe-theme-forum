const express = require('express');
const router = express.Router();

// Public route to get all courses (no authentication required)
router.get('/', (req, res) => {
    try {
        const allCourses = [];

        // Get enrollment counts
        let enrollments = [];
        try {
            const { getEnrollments } = require('./enrollments');
            enrollments = getEnrollments();
        } catch (enrollError) {
            console.log('⚠️ Could not load enrollments:', enrollError.message);
        }

        // First, try to get courses from the weekly schedule model
        try {
            const courseScheduleModel = require('../models/courseSchedule');
            const schedules = courseScheduleModel.getAll();

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
                            instructorName: schedule.instructorName,
                            enrolledStudents: enrollments.filter(e => e.courseId === (course._id || `${schedule._id}_${course.dayOfWeek}`)).length
                        };
                        allCourses.push(individualCourse);
                    });
                }
            });

            console.log(`✅ Found ${allCourses.length} courses from ${schedules.length} weekly schedules`);
        } catch (scheduleError) {
            console.log('⚠️ Could not load from weekly schedules:', scheduleError.message);
        }

        // Also try to get individual courses from the simple database
        try {
            const { courseSchedules } = require('../config/db-simple');
            const individualCourses = Array.from(courseSchedules.values());

            individualCourses.forEach(course => {
                if (course.title && course.day) {
                    // This is already in individual course format
                    allCourses.push({
                        _id: course._id,
                        title: course.title,
                        description: course.description,
                        day: course.day,
                        time: course.time,
                        duration: course.duration,
                        maxStudents: course.maxStudents,
                        status: course.status || 'active',
                        instructorName: 'Admin',
                        enrolledStudents: enrollments.filter(e => e.courseId === course._id).length
                    });
                }
            });

            console.log(`✅ Found ${individualCourses.length} individual courses`);
        } catch (simpleError) {
            console.log('⚠️ Could not load from simple database:', simpleError.message);
        }

        console.log(`🎯 Total courses found: ${allCourses.length}`);
        res.json(allCourses);
    } catch (error) {
        console.error('Error getting courses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
