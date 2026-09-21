import React from 'react';

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-2xl ${className}`} />;
}

export function DocumentCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#161617] rounded-3xl p-6 border border-[#e5e5ea] dark:border-[#262629] space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="w-16 h-5 rounded-full" />
        <Skeleton className="w-20 h-5 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/2 h-3" />
      </div>
      <Skeleton className="w-full h-14 rounded-2xl" />
      <div className="flex items-center justify-between pt-2 border-t border-[#e5e5ea] dark:border-[#262629]">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-16 h-4" />
      </div>
    </div>
  );
}
