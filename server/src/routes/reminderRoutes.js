const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const authGuard = require('../middleware/authGuard');

router.use(authGuard);

router.get('/', reminderController.getAll);
router.post('/', reminderController.create);
router.patch('/:id', reminderController.update);
router.delete('/:id', reminderController.delete);

module.exports = router;
