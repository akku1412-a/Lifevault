import React, { useState, useEffect } from 'react';
import { auditApi } from '../services/api';
import { formatDate } from '../utils/formatters';
import {
  History,
  UploadCloud,
  Eye,
  Download,
  Edit3,
  Trash2,
  Sparkles,
  Archive,
  RefreshCw,
  ShieldCheck,
  Filter
} from 'lucide-react';

const ACTION_MAP = {
  UPLOAD: { label: 'Uploaded', icon: UploadCloud },
  VIEW: { label: 'Viewed', icon: Eye },
  DOWNLOAD: { label: 'Downloaded', icon: Download },
  UPDATE: { label: 'Updated', icon: Edit3 },
  DELETE: { label: 'Deleted', icon: Trash2 },
  AI_PROCESS: { label: 'AI Analyzed', icon: Sparkles },
  REPROCESS: { label: 'Reprocessed', icon: RefreshCw },
  ARCHIVE: { label: 'Archived', icon: Archive }
};

export default function ActivityPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState('');

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await auditApi.getAll({
        action: selectedAction || undefined,
        limit: 50
      });
      if (res.data.success) {
        setLogs(res.data.data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedAction]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Audit Activity
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Immutable timeline of document actions, security events, and AI processing.
          </p>
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#161617] border border-[#e5e5ea] dark:border-[#262629] text-xs font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none shadow-sm"
          >
            <option value="">All Actions</option>
            <option value="UPLOAD">Uploads</option>
            <option value="VIEW">Views</option>
            <option value="DOWNLOAD">Downloads</option>
            <option value="UPDATE">Updates</option>
            <option value="DELETE">Deletions</option>
            <option value="AI_PROCESS">AI Processing</option>
            <option value="ARCHIVE">Archive</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      {isLoading ? (
        <div className="space-y-3 animate-fadeIn">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-3xl bg-neutral-100 dark:bg-[#161617] animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white dark:bg-[#161617] rounded-3xl p-16 text-center border border-[#e5e5ea] dark:border-[#262629] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
            <History className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            No activity recorded
          </h3>
          <p className="text-xs text-neutral-400">
            Document actions will appear here with timestamps.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161617] rounded-3xl border border-[#e5e5ea] dark:border-[#262629] divide-y divide-[#e5e5ea] dark:divide-[#262629] overflow-hidden shadow-sm">
          {logs.map((log) => {
            const meta = ACTION_MAP[log.action] || { label: log.action, icon: History };
            const Icon = meta.icon;
            const docTitle = log.documentId?.title || log.details?.title || log.details?.fileName || 'Document';

            return (
              <div
                key={log._id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 stroke-[1.8]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                      {meta.label}: <span className="font-normal text-neutral-600 dark:text-neutral-300">{docTitle}</span>
                    </p>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      IP: {log.ipAddress || '127.0.0.1'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-xs font-mono text-neutral-400">
                  {formatDate(log.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
