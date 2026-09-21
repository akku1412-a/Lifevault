import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { documentsApi, remindersApi } from '../services/api';
import { formatDate, formatBytes } from '../utils/formatters';
import { CategoryBadge, ExpiryBadge, ProcessingBadge } from '../components/common/Badge';
import AIInsightCard from '../components/ai/AIInsightCard';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  ArrowLeft,
  Download,
  Edit3,
  Trash2,
  Archive,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Copy,
  Check,
  Calendar,
  Building2,
  Tag,
  Clock,
  HardDrive,
  Hash,
  BellRing,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Metadata Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editIssuer, setEditIssuer] = useState('');
  const [editDocumentDate, setEditDocumentDate] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editTags, setEditTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reminder Modal
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderNotes, setReminderNotes] = useState('');
  const [isSchedulingReminder, setIsSchedulingReminder] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState(false);

  // Extracted Text section
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [isTextCopied, setIsTextCopied] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);

  // Delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDocument = async () => {
    try {
      setIsLoading(true);
      const res = await documentsApi.getById(id);
      if (res.data.success) {
        const doc = res.data.data.document;
        setDocument(doc);
        setEditTitle(doc.title);
        setEditCategory(doc.category);
        setEditIssuer(doc.issuer || '');
        setEditDocumentDate(doc.documentDate ? new Date(doc.documentDate).toISOString().split('T')[0] : '');
        setEditExpiryDate(doc.expiryDate ? new Date(doc.expiryDate).toISOString().split('T')[0] : '');
        setEditTags(doc.tags ? doc.tags.join(', ') : '');
      }
    } catch (err) {
      setError(err.message || 'Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const handleSaveMetadata = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updateData = {
        title: editTitle.trim(),
        category: editCategory,
        issuer: editIssuer.trim() || null,
        documentDate: editDocumentDate ? new Date(editDocumentDate) : null,
        expiryDate: editExpiryDate ? new Date(editExpiryDate) : null,
        tags: editTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
      };

      const res = await documentsApi.update(id, updateData);
      if (res.data.success) {
        setDocument(res.data.data.document);
        setIsEditModalOpen(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to update document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReprocess = async () => {
    try {
      setIsReprocessing(true);
      const res = await documentsApi.reprocess(id);
      if (res.data.success) {
        setDocument(res.data.data.document);
        setTimeout(fetchDocument, 3500);
      }
    } catch (err) {
      alert(err.message || 'Failed to reprocess document');
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleToggleArchive = async () => {
    if (!document) return;
    try {
      const res = await documentsApi.update(id, { isArchived: !document.isArchived });
      if (res.data.success) {
        setDocument(res.data.data.document);
      }
    } catch (err) {
      alert(err.message || 'Failed to update archive status');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await documentsApi.delete(id);
      navigate('/app/documents');
    } catch (err) {
      alert(err.message || 'Failed to delete document');
      setIsDeleting(false);
    }
  };

  const handleCopyText = () => {
    if (document?.extractedText) {
      navigator.clipboard.writeText(document.extractedText);
      setIsTextCopied(true);
      setTimeout(() => setIsTextCopied(false), 2000);
    }
  };

  const handleScheduleReminder = async (e) => {
    e.preventDefault();
    if (!reminderDate) return;
    try {
      setIsSchedulingReminder(true);
      const res = await remindersApi.create({
        documentId: document._id,
        reminderDate: new Date(reminderDate),
        title: `Reminder: ${document.title}`,
        notes: reminderNotes.trim()
      });
      if (res.data.success) {
        setReminderSuccess(true);
        setTimeout(() => {
          setIsReminderModalOpen(false);
          setReminderSuccess(false);
          setReminderDate('');
          setReminderNotes('');
        }, 1200);
      }
    } catch (err) {
      alert(err.message || 'Failed to schedule reminder');
    } finally {
      setIsSchedulingReminder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 space-y-8 animate-fadeIn">
        <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-[600px] rounded-3xl bg-neutral-100 dark:bg-[#161617] animate-pulse" />
          <div className="lg:col-span-5 space-y-6">
            <div className="h-48 rounded-3xl bg-neutral-100 dark:bg-[#161617] animate-pulse" />
            <div className="h-64 rounded-3xl bg-neutral-100 dark:bg-[#161617] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          {error || 'Document not found'}
        </h2>
        <p className="text-sm text-neutral-500">
          This document could not be found or you do not have permission to access it.
        </p>
        <button
          onClick={() => navigate('/app/documents')}
          className="px-6 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-xs"
        >
          Back to Documents
        </button>
      </div>
    );
  }

  const token = localStorage.getItem('lifevault_token');
  const previewUrl = documentsApi.getPreviewUrl(document._id, token);
  const downloadUrl = documentsApi.getDownloadUrl(document._id, token);
  const isPdf = document.mimeType === 'application/pdf';

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2 animate-fadeIn">
      {/* Back link & Actions Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/app/documents')}
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Documents</span>
        </button>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={downloadUrl}
            download={document.originalFileName}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-neutral-100 dark:bg-[#161617] border border-[#e5e5ea] dark:border-[#262629] text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-neutral-100 dark:bg-[#161617] border border-[#e5e5ea] dark:border-[#262629] text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReminderModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-neutral-100 dark:bg-[#161617] border border-[#e5e5ea] dark:border-[#262629] text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Reminder</span>
          </button>

          <button
            type="button"
            onClick={handleToggleArchive}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-neutral-100 dark:bg-[#161617] border border-[#e5e5ea] dark:border-[#262629] text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{document.isArchived ? 'Unarchive' : 'Archive'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Preview on Left, Metadata & AI on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Document Preview & OCR Text */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#161617] rounded-3xl border border-[#e5e5ea] dark:border-[#262629] overflow-hidden shadow-sm flex flex-col">
            {/* Preview Toolbar */}
            <div className="p-4 px-6 border-b border-[#e5e5ea] dark:border-[#262629] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate max-w-xs">
                  {document.originalFileName}
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  ({formatBytes(document.fileSize)})
                </span>
              </div>

              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Full screen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Document Render Zone */}
            <div className="relative min-h-[500px] max-h-[700px] flex items-center justify-center bg-neutral-50 dark:bg-[#111112] overflow-hidden">
              {isPdf ? (
                <iframe
                  src={previewUrl}
                  title={document.title}
                  className="w-full h-[650px] border-0"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt={document.title}
                  className="max-h-[650px] max-w-full object-contain p-4 transition-transform"
                />
              )}
            </div>
          </div>

          {/* OCR Extracted Text Accordion */}
          {document.extractedText && (
            <div className="bg-white dark:bg-[#161617] rounded-3xl border border-[#e5e5ea] dark:border-[#262629] overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setShowExtractedText(!showExtractedText)}
                className="w-full p-5 px-6 flex items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Raw Extracted Text ({document.extractedText.length} characters)
                  </span>
                </div>
                {showExtractedText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showExtractedText && (
                <div className="p-6 pt-0 space-y-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={handleCopyText}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
                    >
                      {isTextCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isTextCopied ? 'Copied' : 'Copy Text'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1c1c1e] text-xs font-mono text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed border border-neutral-200/60 dark:border-neutral-800">
                    {document.extractedText}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Metadata, LifeVault Intelligence, Audit */}
        <div className="lg:col-span-5 space-y-6">
          {/* Document Title & Status Pill Card */}
          <div className="bg-white dark:bg-[#161617] rounded-3xl p-6 sm:p-7 border border-[#e5e5ea] dark:border-[#262629] space-y-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <CategoryBadge category={document.category} />
              <ExpiryBadge status={document.expiryStatus} />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white tracking-tight">
                {document.title}
              </h1>
              {document.issuer && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Issued by {document.issuer}</span>
                </p>
              )}
            </div>

            {/* Smart Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {document.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* LifeVault Intelligence AI Panel */}
          <AIInsightCard
            document={document}
            onReprocess={handleReprocess}
            isReprocessing={isReprocessing}
          />

          {/* Detailed Document Specs */}
          <div className="bg-white dark:bg-[#161617] rounded-3xl p-6 sm:p-7 border border-[#e5e5ea] dark:border-[#262629] space-y-4 shadow-sm text-xs">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Document Information
            </h3>

            <div className="space-y-3 divide-y divide-neutral-100 dark:divide-neutral-800">
              <div className="flex justify-between items-center pt-2">
                <span className="text-neutral-400">Document Date</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {document.documentDate ? formatDate(document.documentDate) : 'Not specified'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-neutral-400">Expiration Date</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {document.expiryDate ? formatDate(document.expiryDate) : 'No expiration (Permanent)'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-neutral-400">File Type</span>
                <span className="font-mono text-neutral-800 dark:text-neutral-200">
                  {document.mimeType}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-neutral-400">File Size</span>
                <span className="font-mono text-neutral-800 dark:text-neutral-200">
                  {formatBytes(document.fileSize)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-neutral-400">Vaulted Date</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {formatDate(document.createdAt)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-neutral-400">SHA-256 Checksum</span>
                <span className="font-mono text-[10px] text-neutral-500 truncate max-w-[180px]">
                  {document.fileHash}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Metadata Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#161617] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#e5e5ea] dark:border-[#262629] shadow-xl space-y-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Edit Document Metadata
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMetadata} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-neutral-600 dark:text-neutral-400">Document Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-medium text-neutral-600 dark:text-neutral-400">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none"
                  >
                    <option value="identity">Identity</option>
                    <option value="education">Education</option>
                    <option value="certificates">Certificates</option>
                    <option value="finance">Finance</option>
                    <option value="bills">Bills</option>
                    <option value="receipts">Receipts</option>
                    <option value="insurance">Insurance</option>
                    <option value="warranty">Warranty</option>
                    <option value="medical">Medical</option>
                    <option value="employment">Employment</option>
                    <option value="legal">Legal</option>
                    <option value="travel">Travel</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-neutral-600 dark:text-neutral-400">Issuer</label>
                  <input
                    type="text"
                    value={editIssuer}
                    onChange={(e) => setEditIssuer(e.target.value)}
                    placeholder="e.g. Apple Inc."
                    className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-medium text-neutral-600 dark:text-neutral-400">Document Date</label>
                  <input
                    type="date"
                    value={editDocumentDate}
                    onChange={(e) => setEditDocumentDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-neutral-600 dark:text-neutral-400">Expiry Date</label>
                  <input
                    type="date"
                    value={editExpiryDate}
                    onChange={(e) => setEditExpiryDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-neutral-600 dark:text-neutral-400">Smart Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="e.g. warranty, apple, macbook"
                  className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium transition-all shadow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reminder Scheduling Modal */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#161617] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#e5e5ea] dark:border-[#262629] shadow-xl space-y-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Schedule Expiry Reminder
              </h3>
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reminderSuccess ? (
              <div className="text-center py-6 space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Reminder Scheduled
                </h4>
                <p className="text-xs text-neutral-500">
                  You will receive a notification before the deadline arrives.
                </p>
              </div>
            ) : (
              <form onSubmit={handleScheduleReminder} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-medium text-neutral-600 dark:text-neutral-400">Reminder Date</label>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-neutral-600 dark:text-neutral-400">Personal Notes (optional)</label>
                  <textarea
                    rows="3"
                    value={reminderNotes}
                    onChange={(e) => setReminderNotes(e.target.value)}
                    placeholder="e.g. Call insurer to review rate or renewal incentives"
                    className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReminderModalOpen(false)}
                    className="px-4 py-2.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSchedulingReminder}
                    className="px-5 py-2.5 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium transition-all shadow-sm disabled:opacity-50"
                  >
                    {isSchedulingReminder ? 'Scheduling...' : 'Set Reminder'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Document"
        message={`Are you sure you want to permanently delete "${document.title}"? The encrypted file will be removed from your vault.`}
      />
    </div>
  );
}
