const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authGuard = require('../middleware/authGuard');

router.use(authGuard);

router.get('/', notificationController.getAll);
router.patch('/:id/read', notificationController.markRead);
router.post('/mark-all-read', notificationController.markAllRead);
router.delete('/:id', notificationController.delete);

module.exports = router;
