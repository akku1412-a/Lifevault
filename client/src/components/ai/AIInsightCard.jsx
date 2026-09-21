import React from 'react';
import { formatDate } from '../../utils/formatters';
import { ConfidenceBadge } from '../common/Badge';
import {
  Sparkles,
  Building2,
  Calendar,
  Layers,
  Tag,
  RefreshCw,
  Clock,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export default function AIInsightCard({ document: doc, onReprocess, isReprocessing }) {
  const metadata = doc.aiMetadata || {};
  const importantDates = metadata.importantDates || [];
  const entities = metadata.entities || [];

  return (
    <div className="bg-white dark:bg-[#161617] rounded-3xl p-6 sm:p-7 border border-[#e5e5ea] dark:border-[#262629] space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#e5e5ea] dark:border-[#262629]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center">
            <Sparkles className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              LifeVault Intelligence
            </h3>
            <p className="text-xs text-neutral-400">
              AI-generated analysis & metadata
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ConfidenceBadge confidence={metadata.confidence} />
          <button
            type="button"
            onClick={onReprocess}
            disabled={isReprocessing}
            className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
            title="Reprocess with AI"
            aria-label="Reprocess document with AI"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReprocessing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* AI Summary */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
          Summary
        </span>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal bg-neutral-50 dark:bg-[#1c1c1e] p-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800">
          {doc.aiSummary || 'No summary could be extracted from this document.'}
        </p>
      </div>

      {/* Extracted Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#1c1c1e] border border-neutral-200/60 dark:border-neutral-800 space-y-1">
          <span className="text-neutral-400 block">Document Type</span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            {metadata.documentType || 'General Document'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#1c1c1e] border border-neutral-200/60 dark:border-neutral-800 space-y-1">
          <span className="text-neutral-400 block">Detected Issuer</span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate block">
            {metadata.issuer || doc.issuer || 'Not detected'}
          </span>
        </div>
      </div>

      {/* Important Dates if present */}
      {importantDates.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
            Important Dates Detected
          </span>
          <div className="space-y-1.5">
            {importantDates.map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs p-2.5 px-3.5 rounded-xl bg-neutral-50 dark:bg-[#1c1c1e] border border-neutral-200/60 dark:border-neutral-800"
              >
                <span className="text-neutral-600 dark:text-neutral-400">{d.label}</span>
                <span className="font-mono font-medium text-neutral-900 dark:text-white">
                  {formatDate(d.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detected Entities if present */}
      {entities.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
            Detected Entities
          </span>
          <div className="flex flex-wrap gap-1.5">
            {entities.map((e, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              >
                {e.name} <span className="text-neutral-400 text-[10px]">({e.type})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
