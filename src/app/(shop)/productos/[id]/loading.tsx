import React from "react";

export default function ProductDetailLoading() {
  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white pt-28 pb-20 animate-pulse">
      <div className="container mx-auto px-4">
        {/* Back Link Skeleton */}
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Visual Customizer Placeholder */}
          <div className="w-full aspect-square md:max-h-[500px] bg-slate-100/50 dark:bg-slate-900/50 border border-slate-900/5 dark:border-white/5 rounded-3xl flex items-center justify-center p-8">
            <div className="w-full h-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>

          {/* Right Column: Configure Details Placeholder */}
          <div className="space-y-6">
            {/* Title & Metadata */}
            <div className="space-y-3">
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-9 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>

            {/* Price block */}
            <div className="h-12 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />

            {/* Attributes Selector Placeholder */}
            <div className="space-y-3 border-t border-slate-900/5 dark:border-white/5 pt-6">
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                ))}
              </div>
            </div>

            {/* Customizer Upload area placeholder */}
            <div className="space-y-3 border-t border-slate-900/5 dark:border-white/5 pt-6">
              <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-28 w-full bg-slate-100/50 dark:bg-slate-900/50 border border-dashed border-slate-900/10 dark:border-white/10 rounded-2xl" />
            </div>

            {/* Quantity and CTA Buttons */}
            <div className="flex gap-4 pt-6">
              <div className="h-12 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-12 flex-1 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
