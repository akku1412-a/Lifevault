const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authGuard = require('../middleware/authGuard');
const { upload, validateUploadedFile } = require('../middleware/upload');

// Apply authGuard to all document routes
router.use(authGuard);

// Aggregations and Searches (Declared before parameterized :id)
router.get('/search', documentController.search);
router.get('/expiring', documentController.getExpiring);
router.get('/stats', documentController.getStats);

// Document CRUD
router.post('/', upload.single('file'), validateUploadedFile, documentController.upload);
router.get('/', documentController.getAll);
router.get('/:id', documentController.getById);
router.patch('/:id', documentController.update);
router.delete('/:id', documentController.delete);

// File streaming and previews
router.get('/:id/preview', documentController.preview);
router.get('/:id/download', documentController.download);

// AI reprocessing
router.post('/:id/analyze', documentController.reprocess);
router.post('/:id/reprocess', documentController.reprocess);

module.exports = router;
