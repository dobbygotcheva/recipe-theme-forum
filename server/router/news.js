const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { auth } = require('../utils');
const upload = require('../utils/upload');

// Public routes
router.get('/', newsController.getPublishedNews);
router.get('/:id', newsController.getNewsById);

module.exports = router;
