const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { auth } = require('../utils');
const upload = require('../utils/upload');
const path = require('path');

router.get('/profile', auth(), authController.getProfileInfo);
router.put('/profile', auth(), authController.editProfileInfo);
router.put('/password', auth(), authController.changePassword);
router.post('/avatar', auth(), upload.single('avatar'), authController.uploadAvatar);
router.get('/avatar/:filename', (req, res) => {
    const { filename } = req.params;
    const avatarPath = path.join(__dirname, '../uploads', filename);
    res.sendFile(avatarPath);
});
router.delete('/profile', auth(), authController.deleteAccount);

module.exports = router