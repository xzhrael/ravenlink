import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      {/* Top Header Skeleton */}
      <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-sm w-full">
          <div className="h-7 w-2/3 bg-neutral-200 dark:bg-neutral-800 border-2 border-black dark:border-white" />
          <div className="h-4 w-5/6 bg-neutral-200 dark:bg-neutral-800 border border-black dark:border-white" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-black text-white dark:bg-white border-2 border-black dark:border-white" />
          <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-800 border-2 border-black dark:border-white" />
        </div>
      </div>

      {/* Grid Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 space-y-2">
            <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-800 border border-black dark:border-white" />
            <div className="h-7 w-1/3 bg-neutral-200 dark:bg-neutral-800 border-2 border-black dark:border-white" />
          </div>
        ))}
      </div>
    </div>
  );
}
