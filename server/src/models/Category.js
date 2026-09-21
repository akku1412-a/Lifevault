const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: 50
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    icon: {
      type: String,
      default: 'Folder'
    },
    color: {
      type: String,
      default: '#22c55e'
    },
    isSystem: {
      type: Boolean,
      default: false
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

categorySchema.index({ userId: 1, slug: 1 }, { unique: true });

// Initial default system categories
categorySchema.statics.SYSTEM_CATEGORIES = [
  { name: 'Identity', slug: 'identity', icon: 'Shield', color: '#3b82f6' },
  { name: 'Education', slug: 'education', icon: 'GraduationCap', color: '#8b5cf6' },
  { name: 'Certificates', slug: 'certificates', icon: 'Award', color: '#ec4899' },
  { name: 'Finance', slug: 'finance', icon: 'Landmark', color: '#10b981' },
  { name: 'Bills', slug: 'bills', icon: 'Receipt', color: '#f59e0b' },
  { name: 'Receipts', slug: 'receipts', icon: 'ShoppingBag', color: '#f97316' },
  { name: 'Insurance', slug: 'insurance', icon: 'HeartPulse', color: '#06b6d4' },
  { name: 'Warranty', slug: 'warranty', icon: 'FileCheck', color: '#14b8a6' },
  { name: 'Medical', slug: 'medical', icon: 'Activity', color: '#ef4444' },
  { name: 'Employment', slug: 'employment', icon: 'Briefcase', color: '#6366f1' },
  { name: 'Legal', slug: 'legal', icon: 'Scale', color: '#84cc16' },
  { name: 'Travel', slug: 'travel', icon: 'Plane', color: '#0ea5e9' },
  { name: 'Other', slug: 'other', icon: 'Folder', color: '#64748b' }
];

module.exports = mongoose.model('Category', categorySchema);
