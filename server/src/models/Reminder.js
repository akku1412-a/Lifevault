const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
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
      required: true,
      index: true
    },
    reminderDate: {
      type: Date,
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['expiry_warning', 'custom_date', 'renewal'],
      default: 'expiry_warning'
    },
    daysBefore: {
      type: Number,
      default: 30
    },
    title: {
      type: String,
      default: 'Document Expiry Reminder'
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'triggered', 'dismissed'],
      default: 'pending',
      index: true
    },
    sentAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

reminderSchema.index({ userId: 1, status: 1, reminderDate: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
