import React from 'react';
import UploadZone from '../components/documents/UploadZone';
import { ShieldCheck, Sparkles, FileText, Lock } from 'lucide-react';

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Vault New Document
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Upload certificates, insurance policies, warranties, or receipts. Gemini AI will analyze, extract metadata, and schedule renewal alerts automatically.
        </p>
      </div>

      {/* Upload Zone */}
      <UploadZone />

      {/* Feature Badges under upload */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-850">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <ShieldCheck className="w-5 h-5 text-vault-400 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-slate-200">Binary Signature Check</p>
            <p className="text-slate-400 text-[11px]">Validates genuine PDF & image magic bytes</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <Sparkles className="w-5 h-5 text-vault-400 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-slate-200">Gemini AI Extraction</p>
            <p className="text-slate-400 text-[11px]">Detects issuers, expiry dates, and tags</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <Lock className="w-5 h-5 text-vault-400 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-slate-200">User Scoped Storage</p>
            <p className="text-slate-400 text-[11px]">Isolated tenant encryption keys</p>
          </div>
        </div>
      </div>
    </div>
  );
}
