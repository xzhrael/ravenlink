import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      {/* Top Banner Skeleton */}
      <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2.5 max-w-md w-full">
          <div className="h-7 w-3/4 bg-neutral-200 dark:bg-neutral-800 border-2 border-black dark:border-white" />
          <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-800 border-2 border-black dark:border-white" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-neutral-200 dark:bg-neutral-800 border-2 border-black dark:border-white" />
          <div className="h-10 w-32 bg-[#FFDE59]/60 border-2 border-black dark:border-white" />
        </div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 sm:p-5 space-y-3">
            <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-800 border border-black dark:border-white" />
            <div className="h-8 w-1/2 bg-neutral-200 dark:bg-neutral-800 border-2 border-black dark:border-white" />
            <div className="h-3 w-2/3 bg-neutral-200 dark:bg-neutral-800 border border-black dark:border-white" />
          </div>
        ))}
      </div>
    </div>
  );
}
