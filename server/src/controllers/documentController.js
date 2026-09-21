const documentService = require('../services/documentService');
const { storageService } = require('../services/storageService');
const auditService = require('../services/auditService');
const ApiResponse = require('../utils/apiResponse');

class DocumentController {
  async upload(req, res, next) {
    try {
      let customData = {};
      if (req.body.metadata) {
        try {
          customData = JSON.parse(req.body.metadata);
        } catch (e) {
          customData = {};
        }
      } else {
        customData = {
          title: req.body.title,
          category: req.body.category,
          tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim())) : [],
          description: req.body.description
        };
      }

      const document = await documentService.createDocument({
        file: req.file,
        userId: req.user._id,
        customData,
        req
      });

      return ApiResponse.created(res, { document }, 'Document uploaded successfully and queued for AI analysis');
    } catch (err) {
      if (err.code === 'DUPLICATE_DOCUMENT') {
        return ApiResponse.conflict(res, err.message, 'DUPLICATE_DOCUMENT', {
          existingDocumentId: err.existingDoc._id,
          title: err.existingDoc.title
        });
      }
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await documentService.getDocuments({
        userId: req.user._id,
        query: req.query
      });
      return ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const document = await documentService.getDocumentById({
        id: req.params.id,
        userId: req.user._id,
        req
      });

      if (!document) {
        return ApiResponse.notFound(res, 'Document not found or access denied', 'DOCUMENT_NOT_FOUND');
      }

      return ApiResponse.success(res, { document });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const document = await documentService.updateDocument({
        id: req.params.id,
        userId: req.user._id,
        updateData: req.body,
        req
      });

      if (!document) {
        return ApiResponse.notFound(res, 'Document not found or access denied', 'DOCUMENT_NOT_FOUND');
      }

      return ApiResponse.success(res, { document }, 'Document updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const success = await documentService.deleteDocument({
        id: req.params.id,
        userId: req.user._id,
        req
      });

      if (!success) {
        return ApiResponse.notFound(res, 'Document not found or access denied', 'DOCUMENT_NOT_FOUND');
      }

      return ApiResponse.success(res, null, 'Document deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  async preview(req, res, next) {
    try {
      const document = await documentService.getDocumentById({
        id: req.params.id,
        userId: req.user._id,
        req
      });

      if (!document) {
        return ApiResponse.notFound(res, 'Document not found or access denied', 'DOCUMENT_NOT_FOUND');
      }

      const stream = await storageService.getStream(document.storageKey);

      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(document.originalFileName)}"`);
      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  }

  async download(req, res, next) {
    try {
      const document = await documentService.getDocumentById({
        id: req.params.id,
        userId: req.user._id,
        req
      });

      if (!document) {
        return ApiResponse.notFound(res, 'Document not found or access denied', 'DOCUMENT_NOT_FOUND');
      }

      const stream = await storageService.getStream(document.storageKey);

      await auditService.log({
        userId: req.user._id,
        documentId: document._id,
        action: 'DOWNLOAD',
        req
      });

      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.originalFileName)}"`);
      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  }

  async reprocess(req, res, next) {
    try {
      const document = await documentService.reprocessDocument({
        id: req.params.id,
        userId: req.user._id,
        req
      });

      if (!document) {
        return ApiResponse.notFound(res, 'Document not found or access denied', 'DOCUMENT_NOT_FOUND');
      }

      return ApiResponse.success(res, { document }, 'Document reprocessing initiated');
    } catch (err) {
      next(err);
    }
  }

  async search(req, res, next) {
    try {
      const results = await documentService.searchDocuments({
        userId: req.user._id,
        query: req.query
      });
      return ApiResponse.success(res, results);
    } catch (err) {
      next(err);
    }
  }

  async getExpiring(req, res, next) {
    try {
      const results = await documentService.getExpiringDocuments({
        userId: req.user._id
      });
      return ApiResponse.success(res, results);
    } catch (err) {
      next(err);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await documentService.getDashboardStats({
        userId: req.user._id
      });
      return ApiResponse.success(res, stats);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DocumentController();
