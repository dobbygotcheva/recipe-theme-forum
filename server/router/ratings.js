const express = require('express');
const router = express.Router();
const { ratingController } = require('../controllers');
const { auth } = require('../utils');

// Rating routes
router.post('/:themeId/rate', auth(), ratingController.addRating);
router.get('/:themeId/ratings', ratingController.getRatings);

// Comment routes
router.post('/:themeId/comments', auth(), ratingController.addComment);
router.post('/:themeId/comments/:commentId/replies', auth(), ratingController.addReply);
router.get('/:themeId/comments', ratingController.getComments);
router.delete('/:themeId/comments/:commentId', auth(), ratingController.deleteComment);

// Comment like/dislike routes
router.post('/:themeId/comments/:commentId/like', auth(), ratingController.likeComment);
router.post('/:themeId/comments/:commentId/dislike', auth(), ratingController.dislikeComment);

module.exports = router; 