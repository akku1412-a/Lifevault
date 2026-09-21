const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authGuard = require('../middleware/authGuard');

router.use(authGuard);

router.get('/', auditController.getAll);

module.exports = router;
