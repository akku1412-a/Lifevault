export const CATEGORIES = [
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

export const EXPIRY_STATUSES = {
  no_expiry: { label: 'No Expiry', color: 'text-slate-400 bg-slate-800/60 border-slate-700' },
  active: { label: 'Active', color: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60' },
  expiring_soon: { label: 'Expiring Soon', color: 'text-amber-400 bg-amber-950/50 border-amber-800/60' },
  expired: { label: 'Expired', color: 'text-rose-400 bg-rose-950/50 border-rose-800/60' }
};

export const PROCESSING_STATUSES = {
  pending: { label: 'Queued', color: 'text-slate-400 bg-slate-800' },
  processing: { label: 'AI Processing...', color: 'text-blue-400 bg-blue-950/50 animate-pulse' },
  completed: { label: 'AI Ready', color: 'text-emerald-400 bg-emerald-950/50' },
  failed: { label: 'Processing Failed', color: 'text-rose-400 bg-rose-950/50' }
};
