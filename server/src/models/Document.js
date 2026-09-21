const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true
    },
    storedFileName: {
      type: String,
      required: true
    },
    storageKey: {
      type: String,
      required: true
    },
    storageDriver: {
      type: String,
      enum: ['local', 's3'],
      default: 'local'
    },
    mimeType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    fileHash: {
      type: String,
      required: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      default: 'other',
      index: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    extractedText: {
      type: String,
      default: ''
    },
    aiSummary: {
      type: String,
      default: ''
    },
    aiMetadata: {
      documentType: { type: String, default: null },
      issuer: { type: String, default: null },
      confidence: { type: Number, default: null },
      importantDates: [
        {
          label: String,
          date: Date
        }
      ],
      entities: [
        {
          name: String,
          type: { type: String }
        }
      ],
      tags: [String]
    },
    documentDate: {
      type: Date,
      default: null
    },
    expiryDate: {
      type: Date,
      default: null,
      index: true
    },
    expiryStatus: {
      type: String,
      enum: ['no_expiry', 'active', 'expiring_soon', 'expired'],
      default: 'no_expiry',
      index: true
    },
    issuer: {
      type: String,
      default: null,
      index: true
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true
    },
    processingError: {
      type: String,
      default: null
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Method to update expiry status based on current date
documentSchema.methods.updateExpiryStatus = function () {
  if (!this.expiryDate) {
    this.expiryStatus = 'no_expiry';
    return this.expiryStatus;
  }

  const now = new Date();
  const expiry = new Date(this.expiryDate);

  // Set times to midnight for clean comparison
  now.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    this.expiryStatus = 'expired';
  } else if (diffDays <= 30) {
    this.expiryStatus = 'expiring_soon';
  } else {
    this.expiryStatus = 'active';
  }

  return this.expiryStatus;
};

// Hook to ensure expiryStatus is always in sync before save
documentSchema.pre('save', function (next) {
  if (this.isModified('expiryDate')) {
    this.updateExpiryStatus();
  }
  next();
});

// Compound Indexes for fast dashboard, list, and user-scoped queries
documentSchema.index({ userId: 1, isArchived: 1, createdAt: -1 });
documentSchema.index({ userId: 1, expiryStatus: 1, expiryDate: 1 });
documentSchema.index({ userId: 1, category: 1 });
documentSchema.index({ userId: 1, fileHash: 1 });

// Full-text search index across searchable fields
documentSchema.index(
  {
    title: 'text',
    extractedText: 'text',
    aiSummary: 'text',
    issuer: 'text',
    tags: 'text',
    description: 'text'
  },
  {
    weights: {
      title: 10,
      issuer: 5,
      tags: 5,
      aiSummary: 3,
      description: 2,
      extractedText: 1
    },
    name: 'DocumentTextSearchIndex'
  }
);

module.exports = mongoose.model('Document', documentSchema);
