import React from "react";

export default function ShopLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="flex flex-col items-center gap-4 relative">
        {/* Glow behind loader */}
        <div className="absolute w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl" />
        
        {/* Modern loading indicator spinner */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full border-2 border-slate-900/5 dark:border-white/5" />
          <span className="absolute inset-0 rounded-full border-2 border-t-indigo-500 border-r-indigo-500 animate-spin" />
          <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">SM</span>
        </div>

        {/* Loading text */}
        <span className="text-xs font-bold tracking-widest text-slate-600 dark:text-slate-400 uppercase animate-pulse">
          Cargando Smartist...
        </span>
      </div>
    </div>
  );
}
