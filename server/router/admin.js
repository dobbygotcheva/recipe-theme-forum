const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const newsController = require('../controllers/newsController');
const { auth } = require('../utils');
const upload = require('../utils/upload');

// Apply auth middleware to all admin routes
router.use(auth());
router.use(adminController.adminAuth());

// Dashboard routes
router.get('/stats', adminController.getStats);
router.get('/activity', adminController.getActivity);

// User management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.put('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

// Theme moderation routes
router.get('/themes', adminController.getAllThemes);
router.put('/themes/:themeId/approve', adminController.approveTheme);
router.put('/themes/:themeId/reject', adminController.rejectTheme);
router.delete('/themes/:themeId', adminController.deleteTheme);

// News management routes
router.get('/news', newsController.getAllNews);
router.post('/news', newsController.createNews);
router.put('/news/:id', newsController.updateNews);
router.delete('/news/:id', newsController.deleteNews);
router.put('/news/:id/publish', newsController.publishNews);
router.put('/news/:id/archive', newsController.archiveNews);
router.post('/news/upload-image', upload.single('image'), newsController.uploadNewsImage);

// Course management routes
router.get('/courses', adminController.getAllCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// Course enrollment routes
router.get('/enrollments', adminController.getAllEnrollments);
router.get('/courses/:courseId/enrollments', adminController.getCourseEnrollments);

module.exports = router;
