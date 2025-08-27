const courseScheduleModel = require('../models/courseSchedule');
const { validateAdmin } = require('../utils/form-validation');

class CourseScheduleController {
    // Get all course schedules (admin only)
    async getAllCourseSchedules(req, res) {
        try {
            // TODO: Add proper admin validation when auth system is fully implemented
            // For now, allow access to get course schedules

            const schedules = courseScheduleModel.getAll();
            res.json(schedules);
        } catch (error) {
            console.error('Error getting course schedules:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Get course schedule by ID
    async getCourseScheduleById(req, res) {
        try {
            const { id } = req.params;
            const schedule = courseScheduleModel.getById(id);

            if (!schedule) {
                return res.status(404).json({ error: 'Course schedule not found' });
            }

            res.json(schedule);
        } catch (error) {
            console.error('Error getting course schedule by ID:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Create new course schedule (admin only)
    async createCourseSchedule(req, res) {
        try {
            // Check if user is admin
            if (!validateAdmin(req)) {
                return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
            }

            const {
                title,
                description,
                weekStartDate,
                weekEndDate,
                courses,
                maxParticipants,
                price,
                instructorId,
                instructorName,
                status = 'draft'
            } = req.body;

            // Validate required fields
            if (!title || !description || !weekStartDate || !weekEndDate || !courses || !instructorId) {
                return res.status(400).json({
                    error: 'Missing required fields: title, description, weekStartDate, weekEndDate, courses, instructorId'
                });
            }

            // Validate courses array
            if (!Array.isArray(courses) || courses.length === 0) {
                return res.status(400).json({ error: 'At least one course is required' });
            }

            // Validate each course
            for (const course of courses) {
                if (!course.dayOfWeek || !course.startTime || !course.endTime || !course.title || !course.difficulty) {
                    return res.status(400).json({
                        error: 'Each course must have: dayOfWeek, startTime, endTime, title, difficulty'
                    });
                }
            }

            // Validate dates
            const startDate = new Date(weekStartDate);
            const endDate = new Date(weekEndDate);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({ error: 'Invalid date format' });
            }

            if (startDate >= endDate) {
                return res.status(400).json({ error: 'Week start date must be before week end date' });
            }

            const scheduleData = {
                title,
                description,
                weekStartDate,
                weekEndDate,
                courses,
                maxParticipants: maxParticipants || null,
                price: price || null,
                instructorId,
                instructorName,
                status
            };

            const newSchedule = courseScheduleModel.create(scheduleData);
            res.status(201).json(newSchedule);
        } catch (error) {
            console.error('Error creating course schedule:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Update course schedule (admin only)
    async updateCourseSchedule(req, res) {
        try {
            // Check if user is admin
            if (!validateAdmin(req)) {
                return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
            }

            const { id } = req.params;
            const updateData = req.body;

            // Check if schedule exists
            const existingSchedule = courseScheduleModel.getById(id);
            if (!existingSchedule) {
                return res.status(404).json({ error: 'Course schedule not found' });
            }

            // Validate courses if provided
            if (updateData.courses && Array.isArray(updateData.courses)) {
                for (const course of updateData.courses) {
                    if (!course.dayOfWeek || !course.startTime || !course.endTime || !course.title || !course.difficulty) {
                        return res.status(400).json({
                            error: 'Each course must have: dayOfWeek, startTime, endTime, title, difficulty'
                        });
                    }
                }
            }

            // Validate dates if provided
            if (updateData.weekStartDate && updateData.weekEndDate) {
                const startDate = new Date(updateData.weekStartDate);
                const endDate = new Date(updateData.weekEndDate);

                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    return res.status(400).json({ error: 'Invalid date format' });
                }

                if (startDate >= endDate) {
                    return res.status(400).json({ error: 'Week start date must be before week end date' });
                }
            }

            const updatedSchedule = courseScheduleModel.update(id, updateData);
            res.json(updatedSchedule);
        } catch (error) {
            console.error('Error updating course schedule:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Update course schedule status (admin only)
    async updateCourseScheduleStatus(req, res) {
        try {
            // Check if user is admin
            if (!validateAdmin(req)) {
                return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
            }

            const { id } = req.params;
            const { status } = req.body;

            // Validate status
            const validStatuses = ['draft', 'published', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: 'Invalid status. Must be one of: draft, published, completed, cancelled'
                });
            }

            // Check if schedule exists
            const existingSchedule = courseScheduleModel.getById(id);
            if (!existingSchedule) {
                return res.status(404).json({ error: 'Course schedule not found' });
            }

            const updatedSchedule = courseScheduleModel.updateStatus(id, status);
            res.json(updatedSchedule);
        } catch (error) {
            console.error('Error updating course schedule status:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Delete course schedule (admin only)
    async deleteCourseSchedule(req, res) {
        try {
            // Check if user is admin
            if (!validateAdmin(req)) {
                return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
            }

            const { id } = req.params;

            // Check if schedule exists
            const existingSchedule = courseScheduleModel.getById(id);
            if (!existingSchedule) {
                return res.status(404).json({ error: 'Course schedule not found' });
            }

            courseScheduleModel.delete(id);
            res.json({ message: 'Course schedule deleted successfully' });
        } catch (error) {
            console.error('Error deleting course schedule:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Get course schedules by instructor
    async getCourseSchedulesByInstructor(req, res) {
        try {
            const { instructorId } = req.params;
            const schedules = courseScheduleModel.getByInstructor(instructorId);
            res.json(schedules);
        } catch (error) {
            console.error('Error getting course schedules by instructor:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Get published course schedules (public endpoint)
    async getPublishedCourseSchedules(req, res) {
        try {
            const schedules = courseScheduleModel.getPublished();
            res.json(schedules);
        } catch (error) {
            console.error('Error getting published course schedules:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new CourseScheduleController();
