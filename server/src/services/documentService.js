const crypto = require('crypto');
const Document = require('../models/Document');
const User = require('../models/User');
const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');
const { storageService } = require('./storageService');
const ocrService = require('./ocrService');
const geminiService = require('./geminiService');
const auditService = require('./auditService');
const logger = require('../utils/logger');

class DocumentService {
  /**
   * Upload and process a new document
   */
  async createDocument({ file, userId, customData = {}, req = null }) {
    // 1. Calculate SHA-256 hash to detect exact duplicates
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    const existingDoc = await Document.findOne({ userId, fileHash, isArchived: false });
    if (existingDoc) {
      const err = new Error(`This file has already been uploaded as "${existingDoc.title}".`);
      err.code = 'DUPLICATE_DOCUMENT';
      err.existingDoc = existingDoc;
      throw err;
    }

    // 2. Persist to storage layer
    const storageResult = await storageService.save({
      buffer: file.buffer,
      originalFileName: file.originalname,
      mimeType: file.verifiedMimeType || file.mimetype
    });

    // Clean initial title
    const initialTitle = customData.title || file.originalname.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    // 3. Create database record
    const document = await Document.create({
      userId,
      originalFileName: file.originalname,
      storedFileName: storageResult.storedFileName,
      storageKey: storageResult.storageKey,
      storageDriver: storageResult.storageDriver,
      mimeType: storageResult.mimeType,
      fileSize: storageResult.fileSize,
      fileHash,
      category: customData.category ? customData.category.toLowerCase() : 'other',
      tags: Array.isArray(customData.tags) ? customData.tags : [],
      title: initialTitle.charAt(0).toUpperCase() + initialTitle.slice(1),
      description: customData.description || '',
      processingStatus: 'processing'
    });

    // 4. Update user's storage usage
    await User.findByIdAndUpdate(userId, {
      $inc: { storageUsage: storageResult.fileSize }
    });

    // 5. Audit Log
    await auditService.log({
      userId,
      documentId: document._id,
      action: 'UPLOAD',
      details: { fileName: file.originalname, fileSize: storageResult.fileSize },
      req
    });

    // 6. Trigger background extraction & AI analysis asynchronously
    setImmediate(() => {
      this.processDocumentContent(document._id, file.buffer, file.originalname, storageResult.mimeType, userId);
    });

    return document;
  }

  /**
   * Asynchronous document content processing (PDF/OCR + Gemini AI)
   */
  async processDocumentContent(documentId, buffer, originalFileName, mimeType, userId) {
    try {
      logger.info(`Starting OCR/Extraction pipeline for document ${documentId}...`);
      
      // Step A: Extract Text
      const extractedText = await ocrService.extractText(buffer, mimeType);

      // Step B: Gemini AI Analysis
      logger.info(`Analyzing document ${documentId} with AI engine...`);
      const aiResult = await geminiService.analyzeDocument({
        text: extractedText,
        originalFileName,
        mimeType
      });

      // Step C: Update Document with AI metadata
      const doc = await Document.findById(documentId);
      if (!doc) return;

      doc.extractedText = extractedText;
      doc.aiSummary = aiResult.summary;
      doc.aiMetadata = {
        documentType: aiResult.documentType,
        issuer: aiResult.issuer,
        confidence: aiResult.confidence,
        importantDates: aiResult.importantDates,
        entities: aiResult.entities,
        tags: aiResult.tags
      };

      // Keep user-supplied category if previously selected, otherwise adopt AI category
      if (doc.category === 'other' && aiResult.category && aiResult.category !== 'other') {
        doc.category = aiResult.category;
      }

      if (aiResult.issuer && !doc.issuer) {
        doc.issuer = aiResult.issuer;
      }

      if (aiResult.documentDate && !doc.documentDate) {
        doc.documentDate = aiResult.documentDate;
      }

      if (aiResult.expiryDate && !doc.expiryDate) {
        doc.expiryDate = aiResult.expiryDate;
        doc.updateExpiryStatus();
      }

      // Merge tags
      if (Array.isArray(aiResult.tags) && aiResult.tags.length > 0) {
        const tagSet = new Set([...doc.tags, ...aiResult.tags]);
        doc.tags = Array.from(tagSet);
      }

      doc.processingStatus = 'completed';
      doc.processingError = null;
      await doc.save();

      // Step D: Create Notification for User
      await Notification.create({
        userId,
        documentId: doc._id,
        title: 'Document AI Analysis Ready',
        message: `LifeVault successfully analyzed "${doc.title}". ${doc.aiSummary ? doc.aiSummary.substring(0, 100) + '...' : ''}`,
        type: 'ai_completed',
        actionUrl: `/app/documents/${doc._id}`
      });

      // Audit Log
      await auditService.log({
        userId,
        documentId: doc._id,
        action: 'AI_PROCESS',
        details: { confidence: aiResult.confidence, category: doc.category }
      });

      logger.info(`Successfully completed AI processing for document: ${doc._id}`);
    } catch (err) {
      logger.error(`Processing error for document ${documentId}: ${err.message}`);
      await Document.findByIdAndUpdate(documentId, {
        processingStatus: 'failed',
        processingError: err.message
      });
    }
  }

  /**
   * Scoped Paginated Document Retrieval
   */
  async getDocuments({ userId, query = {} }) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const filter = {
      userId,
      isArchived: query.isArchived === 'true'
    };

    if (query.category && query.category !== 'all') {
      filter.category = query.category.toLowerCase();
    }

    if (query.expiryStatus && query.expiryStatus !== 'all') {
      filter.expiryStatus = query.expiryStatus;
    }

    if (query.tag) {
      filter.tags = query.tag.toLowerCase();
    }

    if (query.fileType) {
      if (query.fileType === 'pdf') {
        filter.mimeType = 'application/pdf';
      } else if (query.fileType === 'image') {
        filter.mimeType = { $regex: '^image/' };
      }
    }

    // Keyword search filter
    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { issuer: { $regex: term, $options: 'i' } },
        { tags: { $in: [new RegExp(term, 'i')] } },
        { aiSummary: { $regex: term, $options: 'i' } },
        { originalFileName: { $regex: term, $options: 'i' } }
      ];
    }

    // Sorting
    let sort = { createdAt: -1 };
    switch (query.sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'expiring_soon':
        sort = { expiryDate: 1, createdAt: -1 };
        break;
      case 'name_asc':
        sort = { title: 1 };
        break;
      case 'name_desc':
        sort = { title: -1 };
        break;
      case 'recently_accessed':
        sort = { lastAccessedAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const [documents, total] = await Promise.all([
      Document.find(filter).sort(sort).skip(skip).limit(limit),
      Document.countDocuments(filter)
    ]);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single document scoped to authenticated user
   */
  async getDocumentById({ id, userId, req = null }) {
    const document = await Document.findOne({ _id: id, userId });
    if (!document) {
      return null;
    }

    // Refresh last accessed date
    document.lastAccessedAt = new Date();
    await document.save();

    await auditService.log({
      userId,
      documentId: document._id,
      action: 'VIEW',
      req
    });

    return document;
  }

  /**
   * Update document metadata
   */
  async updateDocument({ id, userId, updateData, req = null }) {
    const document = await Document.findOne({ _id: id, userId });
    if (!document) {
      return null;
    }

    const allowedFields = [
      'title',
      'description',
      'category',
      'tags',
      'documentDate',
      'expiryDate',
      'issuer',
      'isArchived'
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        if (field === 'tags' && Array.isArray(updateData[field])) {
          document.tags = updateData[field].map((t) => String(t).trim().toLowerCase()).filter(Boolean);
        } else if (field === 'category') {
          document.category = updateData[field].toLowerCase();
        } else {
          document[field] = updateData[field];
        }
      }
    });

    // Update expiry status
    document.updateExpiryStatus();
    await document.save();

    await auditService.log({
      userId,
      documentId: document._id,
      action: updateData.isArchived !== undefined ? 'ARCHIVE' : 'UPDATE',
      details: updateData,
      req
    });

    return document;
  }

  /**
   * Delete document and physical file
   */
  async deleteDocument({ id, userId, req = null }) {
    const document = await Document.findOne({ _id: id, userId });
    if (!document) {
      return false;
    }

    // Remove from storage
    try {
      await storageService.delete(document.storageKey);
    } catch (err) {
      logger.warn(`Storage delete failed for ${document.storageKey}: ${err.message}`);
    }

    // Decrement user storage usage
    await User.findByIdAndUpdate(userId, {
      $inc: { storageUsage: -document.fileSize }
    });

    // Delete linked reminders and notifications
    await Promise.all([
      Reminder.deleteMany({ documentId: document._id, userId }),
      Notification.deleteMany({ documentId: document._id, userId }),
      Document.deleteOne({ _id: document._id })
    ]);

    await auditService.log({
      userId,
      documentId: id,
      action: 'DELETE',
      details: { title: document.title, fileName: document.originalFileName },
      req
    });

    return true;
  }

  /**
   * Trigger manual reprocessing of document
   */
  async reprocessDocument({ id, userId, req = null }) {
    const document = await Document.findOne({ _id: id, userId });
    if (!document) return null;

    document.processingStatus = 'processing';
    document.processingError = null;
    await document.save();

    const buffer = await storageService.getBuffer(document.storageKey);

    setImmediate(() => {
      this.processDocumentContent(document._id, buffer, document.originalFileName, document.mimeType, userId);
    });

    await auditService.log({
      userId,
      documentId: document._id,
      action: 'REPROCESS',
      req
    });

    return document;
  }

  /**
   * Advanced full-text search across documents
   */
  async searchDocuments({ userId, query }) {
    const q = (query.q || '').trim();
    if (!q) {
      return this.getDocuments({ userId, query });
    }

    const filter = {
      userId,
      isArchived: false,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { originalFileName: { $regex: q, $options: 'i' } },
        { issuer: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { aiSummary: { $regex: q, $options: 'i' } },
        { extractedText: { $regex: q, $options: 'i' } }
      ]
    };

    if (query.category && query.category !== 'all') {
      filter.category = query.category.toLowerCase();
    }

    const documents = await Document.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    return {
      query: q,
      totalMatches: documents.length,
      documents
    };
  }

  /**
   * Retrieve expiring documents grouped by urgency
   */
  async getExpiringDocuments({ userId }) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [expired, in7Days, in30Days, allWithExpiry] = await Promise.all([
      Document.find({ userId, isArchived: false, expiryDate: { $lt: now } }).sort({ expiryDate: 1 }),
      Document.find({ userId, isArchived: false, expiryDate: { $gte: now, $lte: sevenDays } }).sort({ expiryDate: 1 }),
      Document.find({ userId, isArchived: false, expiryDate: { $gt: sevenDays, $lte: thirtyDays } }).sort({ expiryDate: 1 }),
      Document.find({ userId, isArchived: false, expiryDate: { $ne: null } }).sort({ expiryDate: 1 })
    ]);

    return {
      expired,
      in7Days,
      in30Days,
      totalExpiringSoon: in7Days.length + in30Days.length,
      totalExpired: expired.length,
      allWithExpiry
    };
  }

  /**
   * Aggregate high-level dashboard metrics
   */
  async getDashboardStats({ userId }) {
    const [
      totalDocuments,
      categoryStats,
      expiringData,
      processingStats,
      user
    ] = await Promise.all([
      Document.countDocuments({ userId, isArchived: false }),
      Document.aggregate([
        { $match: { userId, isArchived: false } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      this.getExpiringDocuments({ userId }),
      Document.aggregate([
        { $match: { userId } },
        { $group: { _id: '$processingStatus', count: { $sum: 1 } } }
      ]),
      User.findById(userId).select('storageUsage storageQuota')
    ]);

    const recentDocuments = await Document.find({ userId, isArchived: false })
      .sort({ createdAt: -1 })
      .limit(6);

    const categoryMap = {};
    categoryStats.forEach((c) => {
      categoryMap[c._id] = c.count;
    });

    return {
      totalDocuments,
      storageUsage: user ? user.storageUsage : 0,
      storageQuota: user ? user.storageQuota : 1073741824,
      categoryBreakdown: categoryMap,
      expiringSoonCount: expiringData.totalExpiringSoon,
      expiredCount: expiringData.totalExpired,
      processingStatus: processingStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      recentDocuments
    };
  }
}

module.exports = new DocumentService();
