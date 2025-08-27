const express = require('express');
const router = express.Router();
const lotteryController = require('../controllers/lotteryController');
const auth = require('../utils/auth');

// Get current lottery information (with role-based filtering)
router.get('/', auth(false), lotteryController.getLottery);

// Join lottery (requires authentication)
router.post('/join', auth(false), lotteryController.joinLottery);

// Draw winner (admin only)
router.post('/draw-winner', auth(false), lotteryController.drawWinner);

// Reset lottery (admin only)
router.post('/reset', auth(false), lotteryController.resetLottery);

// Update lottery settings (admin only)
router.put('/update', auth(false), lotteryController.updateLottery);

module.exports = router;
