const AuditLog = require('../models/AuditLog');
const ApiResponse = require('../utils/apiResponse');

class AuditController {
  async getAll(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
      const skip = (page - 1) * limit;

      const filter = { userId: req.user._id };

      if (req.query.action) {
        filter.action = req.query.action;
      }

      if (req.query.documentId) {
        filter.documentId = req.query.documentId;
      }

      const [logs, total] = await Promise.all([
        AuditLog.find(filter)
          .populate('documentId', 'title originalFileName category')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        AuditLog.countDocuments(filter)
      ]);

      return ApiResponse.success(res, {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuditController();
