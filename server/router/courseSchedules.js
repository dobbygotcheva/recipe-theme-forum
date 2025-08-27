const express = require('express');
const router = express.Router();
const courseScheduleController = require('../controllers/courseScheduleController');

// Admin routes (require admin privileges)
router.get('/', courseScheduleController.getAllCourseSchedules);
router.post('/', courseScheduleController.createCourseSchedule);
router.put('/:id', courseScheduleController.updateCourseSchedule);
router.delete('/:id', courseScheduleController.deleteCourseSchedule);
router.patch('/:id/status', courseScheduleController.updateCourseScheduleStatus);

// Public routes
router.get('/published', courseScheduleController.getPublishedCourseSchedules);
router.get('/instructor/:instructorId', courseScheduleController.getCourseSchedulesByInstructor);
router.get('/:id', courseScheduleController.getCourseScheduleById);

module.exports = router;
