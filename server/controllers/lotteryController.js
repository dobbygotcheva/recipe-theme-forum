const Lottery = require('../models/lottery');
const auth = require('../utils/auth');

class LotteryController {
    // Get current lottery information
    async getLottery(req, res) {
        try {
            const lottery = Lottery.getLottery();
            
            // If user is not admin, filter out sensitive participant information
            if (!req.user || req.user.role !== 'admin') {
                const filteredLottery = {
                    ...lottery,
                    participants: lottery.participants.length > 0 ? [{ userId: 'hidden', username: 'hidden', joinDate: 'hidden' }] : [],
                    // Keep winner information visible to all users
                    winner: lottery.winner
                };
                
                res.json({
                    success: true,
                    data: filteredLottery
                });
            } else {
                // Admin sees full data
                res.json({
                    success: true,
                    data: lottery
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Join lottery
    async joinLottery(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Не сте оторизирани'
                });
            }

            const userId = req.user._id;
            const username = req.user.username;
            const lottery = Lottery.addParticipant(userId, username);

            res.json({
                success: true,
                message: 'Успешно се присъединихте към томболата!',
                data: lottery
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Draw winner (admin only)
    async drawWinner(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Не сте оторизирани'
                });
            }

            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Нямате права за тази операция'
                });
            }

            const lottery = Lottery.drawWinner();

            res.json({
                success: true,
                message: 'Победителят е избран успешно!',
                data: lottery
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Reset lottery (admin only)
    async resetLottery(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Не сте оторизирани'
                });
            }

            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Нямате права за тази операция'
                });
            }

            const lottery = Lottery.resetLottery();

            res.json({
                success: true,
                message: 'Томболата е рестартирана успешно!',
                data: lottery
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update lottery settings (admin only)
    async updateLottery(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Не сте оторизирани'
                });
            }

            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Нямате права за тази операция'
                });
            }

            const { name, description, prize, endDate, maxParticipants } = req.body;
            const updates = {};

            if (name) updates.name = name;
            if (description) updates.description = description;
            if (prize) updates.prize = prize;
            if (endDate) updates.endDate = new Date(endDate);
            if (maxParticipants) updates.maxParticipants = maxParticipants;

            const lottery = Lottery.updateLottery(updates);

            res.json({
                success: true,
                message: 'Томболата е обновена успешно!',
                data: lottery
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new LotteryController();
