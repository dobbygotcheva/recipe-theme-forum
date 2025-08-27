const express = require('express');
const router = express.Router();

const users = require('./users');
const themes = require('./themes');
const posts = require('./posts');
const likes = require('./likes');
const upload = require('./upload');
const ratings = require('./ratings');
const admin = require('./admin');
const news = require('./news');
const notifications = require('./notifications');
const favorites = require('./favorites');
const courseSchedules = require('./courseSchedules');
const contact = require('./contact');
const lottery = require('./lottery');
const { router: enrollmentsRouter, getEnrollments } = require('./enrollments');
const { authController } = require('../controllers');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.use('/users', users);
router.use('/themes', themes);
router.use('/posts', posts);
router.use('/likes', likes);
router.use('/upload', upload);
router.use('/ratings', ratings);
router.use('/admin', admin);
router.use('/news', news);
router.use('/notifications', notifications);
router.use('/favorites', favorites);
router.use('/course-schedules', courseSchedules);
router.use('/contact', contact);
router.use('/lottery', lottery);
router.use('/courses', require('./courses'));
router.use('/courses', enrollmentsRouter);

module.exports = router;