import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsApi } from '../../services/api';
import { formatBytes } from '../../utils/formatters';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye,
  Check,
  Loader2
} from 'lucide-react';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const PROCESSING_STEPS = [
  { id: 'uploading', label: 'Uploading' },
  { id: 'reading', label: 'Reading document' },
  { id: 'extracting', label: 'Extracting information' },
  { id: 'understanding', label: 'Understanding document' },
  { id: 'organizing', label: 'Organizing' },
  { id: 'ready', label: 'Ready' }
];

export default function UploadZone({ onUploadSuccess }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);

  // Metadata form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [tagsInput, setTagsInput] = useState('');
  const [description, setDescription] = useState('');

  // Upload & Timeline State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedDoc, setUploadedDoc] = useState(null);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndSetFile = (file) => {
    setUploadError(null);
    setUploadedDoc(null);

    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setUploadError(`Unsupported format (${file.type || 'Unknown'}). Please upload a PDF, PNG, JPG, or WEBP file.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File is too large (${formatBytes(file.size)}). Maximum upload size is 25 MB.`);
      return;
    }

    setSelectedFile(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(null);
    setTitle('');
    setTagsInput('');
    setDescription('');
    setUploadError(null);
    setIsProcessing(false);
    setCurrentStepIndex(0);
    setUploadedDoc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || isProcessing) return;

    setIsProcessing(true);
    setCurrentStepIndex(0); // Uploading
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const metadata = {
        title: title.trim(),
        category,
        tags: tagsInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
        description: description.trim()
      };
      formData.append('metadata', JSON.stringify(metadata));

      // 1. Uploading
      const uploadPromise = documentsApi.upload(formData);

      // Simulate sequential stages for intentional user experience
      setTimeout(() => setCurrentStepIndex(1), 600);   // Reading document
      setTimeout(() => setCurrentStepIndex(2), 1400);  // Extracting information
      setTimeout(() => setCurrentStepIndex(3), 2300);  // Understanding document
      setTimeout(() => setCurrentStepIndex(4), 3100);  // Organizing

      const res = await uploadPromise;

      setTimeout(() => {
        setCurrentStepIndex(5); // Ready
        if (res.data.success) {
          setUploadedDoc(res.data.data.document);
          if (onUploadSuccess) onUploadSuccess(res.data.data.document);
        }
      }, 3800);
    } catch (err) {
      setIsProcessing(false);
      setUploadError(err.message || 'Failed to upload document');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="leading-snug">{uploadError}</span>
        </div>
      )}

      {/* Processing Timeline Modal View */}
      {isProcessing ? (
        <div className="bg-white dark:bg-[#161617] rounded-3xl p-8 sm:p-10 border border-neutral-200 dark:border-neutral-800 shadow-sm text-center space-y-8 animate-fadeIn">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white tracking-tight">
              {currentStepIndex === 5 ? 'Document Vaulted' : 'Vaulting Document'}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {currentStepIndex === 5
                ? 'LifeVault Intelligence has analyzed and indexed your document.'
                : 'Encrypting, analyzing content, and building intelligent metadata.'}
            </p>
          </div>

          {/* Sequential Timeline */}
          <div className="max-w-md mx-auto py-2 space-y-4 text-left">
            {PROCESSING_STEPS.map((step, idx) => {
              const isDone = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;
              const isPending = currentStepIndex < idx;

              return (
                <div key={step.id} className="flex items-center gap-4 transition-all duration-300">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold transition-all ${
                      isDone
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                        : isCurrent
                        ? 'border-2 border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium tracking-tight transition-colors ${
                        isDone || isCurrent
                          ? 'text-neutral-900 dark:text-white'
                          : 'text-neutral-400 dark:text-neutral-600'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions when Ready */}
          {currentStepIndex === 5 && uploadedDoc && (
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fadeIn">
              <button
                type="button"
                onClick={handleRemoveFile}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Upload Another
              </button>
              <button
                type="button"
                onClick={() => navigate(`/app/documents/${uploadedDoc._id}`)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>View Document</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drop Zone */}
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-3xl border-2 border-dashed p-12 text-center transition-all cursor-pointer select-none ${
                isDragging
                  ? 'border-neutral-900 dark:border-white bg-neutral-100/80 dark:bg-neutral-900/60 scale-[1.01]'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-[#161617]/50 hover:bg-neutral-50 dark:hover:bg-[#161617]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
              />

              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-center mx-auto mb-5 shadow-sm text-neutral-700 dark:text-neutral-200">
                <UploadCloud className="w-8 h-8 stroke-[1.8]" />
              </div>

              <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white tracking-tight">
                Drop your documents here
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                PDF, JPG, PNG or WEBP
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                Up to 25 MB per document
              </p>

              <button
                type="button"
                className="mt-6 px-5 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-medium text-xs shadow-sm hover:scale-105 transition-transform pointer-events-none"
              >
                Browse Files
              </button>
            </div>
          ) : (
            /* Selected File Review Card */
            <div className="bg-white dark:bg-[#161617] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-700 dark:text-neutral-200">
                    {selectedFile.type.startsWith('image/') ? (
                      <ImageIcon className="w-7 h-7" />
                    ) : (
                      <FileText className="w-7 h-7" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-900 dark:text-white truncate text-base">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {formatBytes(selectedFile.size)} • {selectedFile.type || 'Document'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Remove selected file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Optional Metadata Inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 tracking-wide uppercase">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Passport, MacBook Warranty, Tax Return"
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 tracking-wide uppercase">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
                    >
                      <option value="other">Other</option>
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
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 tracking-wide uppercase">
                      Smart Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="e.g. apple, hardware, 2026"
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Upload CTA */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="px-5 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
                >
                  <span>Vault Document</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
