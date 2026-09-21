const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
      index: true
    },
    action: {
      type: String,
      enum: ['UPLOAD', 'VIEW', 'DOWNLOAD', 'UPDATE', 'DELETE', 'AI_PROCESS', 'REPROCESS', 'ARCHIVE'],
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ documentId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
