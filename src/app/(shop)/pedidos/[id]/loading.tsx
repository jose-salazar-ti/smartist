import React from "react";

export default function OrderDetailLoading() {
  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white pt-28 pb-20 animate-pulse">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        {/* Header Title Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-3">
            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-9 w-60 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>

        {/* Tracking Progress Bar Skeleton */}
        <div className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-900/5 dark:border-white/5 p-6 rounded-3xl space-y-6">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="w-full h-3 bg-slate-300/60 dark:bg-slate-850 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1/3 h-full bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="grid grid-cols-4 gap-4 text-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Detail Columns Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer / Payment info card */}
          <div className="md:col-span-2 space-y-6">
            <div className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-900/5 dark:border-white/5 p-6 rounded-3xl space-y-4">
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>

            {/* Order Items card placeholder */}
            <div className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-900/5 dark:border-white/5 p-6 rounded-3xl space-y-4">
              <div className="h-5 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 items-center py-2 border-t border-slate-900/5 dark:border-white/5">
                  <div className="w-12 h-12 bg-slate-300/60 dark:bg-slate-850 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="h-4 w-14 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Payment instructions card placeholder */}
          <div className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-900/5 dark:border-white/5 p-6 rounded-3xl space-y-4 h-fit">
            <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="w-full h-32 bg-slate-300/60 dark:bg-slate-850 rounded-2xl" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
