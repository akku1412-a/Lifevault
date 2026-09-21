const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authGuard = require('../middleware/authGuard');

router.use(authGuard);

router.get('/', categoryController.getAll);
router.post('/', categoryController.create);
router.delete('/:id', categoryController.delete);

module.exports = router;
