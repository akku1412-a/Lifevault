import React from 'react';
import { EXPIRY_STATUSES, PROCESSING_STATUSES } from '../../utils/constants';
import { Sparkles, AlertTriangle, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';

export function ExpiryBadge({ status }) {
  let badgeStyle = 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300';
  let label = 'No Expiry';
  let Icon = Clock;

  if (status === 'active') {
    badgeStyle = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    label = 'Active';
    Icon = CheckCircle2;
  } else if (status === 'expiring_soon') {
    badgeStyle = 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
    label = 'Expiring Soon';
    Icon = AlertTriangle;
  } else if (status === 'expired') {
    badgeStyle = 'bg-rose-500/10 text-rose-700 dark:text-rose-400';
    label = 'Expired';
    Icon = XCircle;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeStyle}`}>
      <Icon className="w-3 h-3 stroke-[2.2]" />
      <span>{label}</span>
    </span>
  );
}

export function CategoryBadge({ category }) {
  const displayCategory = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Other';

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
      {displayCategory}
    </span>
  );
}

export function ConfidenceBadge({ confidence }) {
  if (confidence === null || confidence === undefined) return null;
  const pct = Math.round(confidence * 100);

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
      <Sparkles className="w-3 h-3 text-neutral-500" />
      <span>{pct}% Confidence</span>
    </span>
  );
}

export function ProcessingBadge({ status }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="w-3 h-3" />
        <span>Analyzed</span>
      </span>
    );
  }

  if (status === 'processing') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Processing</span>
      </span>
    );
  }

  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400">
        <AlertTriangle className="w-3 h-3" />
        <span>Failed</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
      <span>Pending</span>
    </span>
  );
}
