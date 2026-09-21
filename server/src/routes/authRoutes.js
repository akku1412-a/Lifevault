const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authGuard = require('../middleware/authGuard');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authGuard, authController.logout);
router.get('/me', authGuard, authController.getMe);
router.patch('/profile', authGuard, authController.updateProfile);

module.exports = router;
