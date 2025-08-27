const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { auth } = require('../utils');
const adminController = require('../controllers/adminController');

// Public route - submit contact form
router.post('/', contactController.submitContact);

// User route - get user's own messages (requires authentication)
router.get('/user/:userId', auth(), contactController.getUserContactMessages);

// Admin routes - require authentication and admin role
router.use(auth());
router.use(adminController.adminAuth());

// Get all contact messages
router.get('/', contactController.getAllContactMessages);

// Get contact statistics (must come before /:id route)
router.get('/stats/overview', contactController.getContactStats);

// Get contact message by ID
router.get('/:id', contactController.getContactMessageById);

// Update contact message status
router.put('/:id', contactController.updateContactMessageStatus);

// Delete contact message
router.delete('/:id', contactController.deleteContactMessage);

module.exports = router;
