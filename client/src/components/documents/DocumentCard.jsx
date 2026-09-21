import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryBadge, ExpiryBadge, ProcessingBadge } from '../common/Badge';
import { formatDate, formatBytes } from '../../utils/formatters';
import { documentsApi } from '../../services/api';
import {
  FileText,
  Image as ImageIcon,
  Building2,
  Download,
  Trash2,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function DocumentCard({ document: doc, onDeleteClick }) {
  const navigate = useNavigate();
  const isPdf = doc.mimeType === 'application/pdf';

  const handleDownload = (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('lifevault_token');
    window.open(documentsApi.getDownloadUrl(doc._id, token), '_blank');
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDeleteClick) onDeleteClick(doc);
  };

  return (
    <div
      onClick={() => navigate(`/app/documents/${doc._id}`)}
      className="group bg-white dark:bg-[#161617] rounded-3xl p-5 sm:p-6 border border-[#e5e5ea] dark:border-[#262629] hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer flex flex-col justify-between shadow-sm relative overflow-hidden"
    >
      <div>
        {/* Top Header: Category & Expiry */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <CategoryBadge category={doc.category} />
          {doc.processingStatus !== 'completed' ? (
            <ProcessingBadge status={doc.processingStatus} />
          ) : (
            <ExpiryBadge status={doc.expiryStatus} />
          )}
        </div>

        {/* Document Icon & Title */}
        <div className="space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shrink-0">
              {isPdf ? <FileText className="w-6 h-6 stroke-[1.8]" /> : <ImageIcon className="w-6 h-6 stroke-[1.8]" />}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white truncate group-hover:underline">
                {doc.title}
              </h3>
              {doc.issuer ? (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5 truncate">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{doc.issuer}</span>
                </p>
              ) : (
                <p className="text-xs text-neutral-400 truncate mt-0.5 font-mono">
                  {doc.originalFileName}
                </p>
              )}
            </div>
          </div>

          {/* AI Summary snippet if present */}
          {doc.aiSummary && (
            <div className="p-3 rounded-2xl bg-[#fbfbfd] dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#262629] text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
              <span className="inline-flex items-center gap-1 font-medium text-neutral-900 dark:text-white mr-1.5">
                <Sparkles className="w-3 h-3" /> AI Summary:
              </span>
              {doc.aiSummary}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-5 mt-4 border-t border-[#e5e5ea] dark:border-[#262629] flex items-center justify-between text-xs text-neutral-400">
        <div>
          <span>{formatBytes(doc.fileSize)}</span>
          <span className="mx-1.5">•</span>
          <span>{formatDate(doc.createdAt)}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Download Document"
            aria-label="Download document"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Delete Document"
            aria-label="Delete document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
