import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryBadge, ExpiryBadge, ProcessingBadge } from '../common/Badge';
import { formatDate, formatBytes } from '../../utils/formatters';
import { documentsApi } from '../../services/api';
import { FileText, Image as ImageIcon, Download, Trash2, ArrowUpRight } from 'lucide-react';

export default function DocumentTable({ documents, onDeleteClick }) {
  const navigate = useNavigate();

  const handleDownload = (docId) => {
    const token = localStorage.getItem('lifevault_token');
    window.open(documentsApi.getDownloadUrl(docId, token), '_blank');
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-[#e5e5ea] dark:border-[#262629] bg-white dark:bg-[#161617] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-800 dark:text-neutral-200">
          <thead className="bg-[#fbfbfd] dark:bg-[#1c1c1e] text-xs font-semibold text-neutral-500 uppercase tracking-wider border-b border-[#e5e5ea] dark:border-[#262629]">
            <tr>
              <th className="py-4 px-5">Document</th>
              <th className="py-4 px-5">Category</th>
              <th className="py-4 px-5">Issuer</th>
              <th className="py-4 px-5">Expiry Date</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5">Size</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5ea] dark:divide-[#262629]">
            {documents.map((doc) => {
              const isPdf = doc.mimeType === 'application/pdf';
              return (
                <tr
                  key={doc._id}
                  onClick={() => navigate(`/app/documents/${doc._id}`)}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors group"
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-900 dark:text-white truncate max-w-xs group-hover:underline">
                          {doc.title}
                        </p>
                        <p className="text-xs text-neutral-400 truncate max-w-xs font-mono">
                          {doc.originalFileName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <CategoryBadge category={doc.category} />
                  </td>
                  <td className="py-4 px-5 text-neutral-600 dark:text-neutral-300 text-xs">
                    {doc.issuer || '—'}
                  </td>
                  <td className="py-4 px-5 text-xs text-neutral-600 dark:text-neutral-300">
                    {doc.expiryDate ? formatDate(doc.expiryDate) : 'Permanent'}
                  </td>
                  <td className="py-4 px-5">
                    {doc.processingStatus !== 'completed' ? (
                      <ProcessingBadge status={doc.processingStatus} />
                    ) : (
                      <ExpiryBadge status={doc.expiryStatus} />
                    )}
                  </td>
                  <td className="py-4 px-5 text-xs text-neutral-400 font-mono">
                    {formatBytes(doc.fileSize)}
                  </td>
                  <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleDownload(doc._id)}
                        title="Download"
                        aria-label="Download document"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteClick && onDeleteClick(doc)}
                        title="Delete"
                        aria-label="Delete document"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
