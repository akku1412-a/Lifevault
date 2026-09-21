const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

class AuditService {
  async log({ userId, documentId = null, action, details = {}, req = null }) {
    try {
      const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || null) : null;
      const userAgent = req ? req.headers['user-agent'] : null;

      await AuditLog.create({
        userId,
        documentId,
        action,
        details,
        ipAddress,
        userAgent
      });
    } catch (err) {
      logger.error('Failed to write audit log entry:', err.message);
    }
  }
}

module.exports = new AuditService();
