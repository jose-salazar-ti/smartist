"use client";
import React, { useState, useEffect } from "react";

interface StackedPhotosProps {
  imageUrls: string[];
  mode?: "stack" | "universe" | "hanging";
}

export function StackedPhotos({ imageUrls, mode = "stack" }: StackedPhotosProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!imageUrls || imageUrls.length === 0) return null;

  // Render single clean preview
  if (imageUrls.length === 1) {
    return (
      <div className="w-full h-64 rounded-2xl overflow-hidden shadow-lg border border-white/10 relative bg-black/5 dark:bg-white/5 flex items-center justify-center">
        <img
          src={imageUrls[0]}
          alt="Foto dedicada"
          className="w-full h-full object-contain rounded-2xl"
        />
      </div>
    );
  }

  // --- MODE 1: UNIVERSE SPACE ---
  if (mode === "universe") {
    // Fixed background float positions for secondary images
    const backgroundPositions = [
      { transform: "translate(-110px, -70px) rotate(-12deg) scale(0.6)" },
      { transform: "translate(110px, -60px) rotate(15deg) scale(0.55)" },
      { transform: "translate(-100px, 70px) rotate(10deg) scale(0.5)" },
      { transform: "translate(100px, 80px) rotate(-8deg) scale(0.65)" },
      { transform: "translate(-120px, 0px) rotate(-5deg) scale(0.45)" },
      { transform: "translate(120px, 10px) rotate(8deg) scale(0.5)" },
    ];

    return (
      <div className="relative w-full h-76 flex items-center justify-center select-none overflow-hidden py-4 bg-slate-950/20 rounded-3xl border border-white/5">
        {/* Twinkling star particle effects in background */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-ping"
              style={{
                top: `${(i * 17) % 100}%`,
                left: `${(i * 23) % 100}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: "3s"
              }}
            />
          ))}
        </div>

        {/* Center glowing nebula effect behind active card */}
        <div className="absolute w-44 h-44 rounded-full bg-indigo-500/20 blur-[80px] z-0 animate-pulse pointer-events-none" />

        <div className="relative w-40 h-52 flex items-center justify-center overflow-visible">
          {imageUrls.map((url, index) => {
            const isActive = index === activeIndex;
            
            // Assign a stable float position based on index offset
            let styleTransform = "";
            let zIndex = 10;
            let opacity = 1;
            let isFloater = false;

            if (isActive) {
              styleTransform = "translate(0px, 0px) rotate(0deg) scale(1)";
              zIndex = 20;
              opacity = 1;
            } else {
              isFloater = true;
              const posIndex = (index > activeIndex ? index - 1 : index) % backgroundPositions.length;
              styleTransform = backgroundPositions[posIndex].transform;
              zIndex = 5;
              opacity = 0.35;
            }

            return (
              <div
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border transition-all cursor-pointer bg-slate-900 flex items-center justify-center ${
                  isActive 
                    ? "border-indigo-400/80 ring-4 ring-indigo-500/30 shadow-[0_0_25px_rgba(99,102,241,0.4)]" 
                    : "border-white/10 hover:opacity-70 blur-[0.5px]"
                } ${isFloater ? "animate-bobbing" : ""}`}
                style={{
                  transform: styleTransform,
                  zIndex: zIndex,
                  opacity: opacity,
                  transition: "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
                  animation: isFloater ? `floatBob ${3 + (index % 3)}s ease-in-out infinite alternate` : undefined
                }}
              >
                <img
                  src={url}
                  alt={`Foto dedicada ${index + 1}`}
                  className="w-full h-full object-cover pointer-events-none rounded-2xl"
                />

                {isActive && (
                  <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded-full text-[9px] font-bold text-white tracking-wider z-20">
                    {index + 1} / {imageUrls.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Floating Animation stylesheet */}
        <style jsx global>{`
          @keyframes floatBob {
            0% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
            100% { transform: translateY(-8px) rotate(var(--rot, 2deg)); }
          }
        `}</style>
      </div>
    );
  }

  // --- MODE 2: HANGING CLOTHESLINE ---
  if (mode === "hanging") {
    return (
      <div className="relative w-full h-76 flex flex-col items-center justify-center select-none overflow-hidden py-6 bg-amber-50/5 dark:bg-slate-950/20 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
        
        {/* Rope Line */}
        <div className="absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-800/40 dark:via-white/30 to-transparent z-0" />

        {/* Photos hanging container */}
        <div className="flex gap-4 items-start justify-center w-full px-6 overflow-x-auto pb-4 scrollbar-none z-10">
          {imageUrls.map((url, index) => {
            const isActive = index === activeIndex;
            
            return (
              <div
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`relative shrink-0 w-28 h-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-1.5 rounded-sm shadow-md cursor-pointer transition-all duration-500 origin-top ${
                  isActive 
                    ? "scale-110 -translate-y-[-8px] rotate-0 shadow-lg border-indigo-400 dark:border-indigo-400" 
                    : "opacity-60 scale-90 rotate-[-4deg] hover:opacity-90"
                }`}
                style={{
                  animation: !isActive ? `hangingSwing ${2.5 + (index % 2)}s ease-in-out infinite alternate` : undefined,
                  transformOrigin: "top center"
                }}
              >
                {/* Pin / Peg element */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-2 h-4 bg-amber-700/80 rounded shadow-sm z-30 border border-amber-950/20 flex flex-col items-center">
                  <div className="w-1 h-1 bg-amber-950/40 rounded-full mt-1" />
                </div>

                <div className="w-full h-full overflow-hidden rounded-[2px] bg-slate-100 flex items-center justify-center">
                  <img
                    src={url}
                    alt={`Hanging photo ${index + 1}`}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>

                {isActive && (
                  <div className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-bold text-white z-20">
                    {index + 1} / {imageUrls.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Swing animation stylesheet */}
        <style jsx global>{`
          @keyframes hangingSwing {
            0% { transform: rotate(-3deg); }
            100% { transform: rotate(3deg); }
          }
        `}</style>
      </div>
    );
  }

  // --- MODE 3: STACK (DEFAULT) ---
  return (
    <div className="relative w-full h-72 flex items-center justify-center select-none overflow-visible py-4">
      <div className="relative w-44 h-56 flex items-center justify-center overflow-visible">
        {imageUrls.map((url, index) => {
          const offset = index - activeIndex;
          const isActive = index === activeIndex;
          
          let rotation = 0;
          let scale = 1;
          let translate = 0;
          let zIndex = 10 - Math.abs(offset);
          let opacity = 1;

          if (!isActive) {
            rotation = offset * 6; 
            scale = 0.85 - Math.min(Math.abs(offset) * 0.05, 0.1); 
            translate = offset * 36; 
            opacity = 0.45; 
          }

          return (
            <div
              key={index}
              onClick={() => setActiveIndex(index)}
              style={{
                transform: `translateX(${translate}px) rotate(${rotation}deg) scale(${scale})`,
                zIndex: zIndex,
                opacity: opacity,
              }}
              className={`absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border border-white/20 transition-all duration-500 cursor-pointer bg-slate-900 flex items-center justify-center ${
                isActive ? "ring-2 ring-indigo-500 shadow-indigo-500/20" : ""
              }`}
            >
              <img
                src={url}
                alt={`Foto dedicada ${index + 1}`}
                className="w-full h-full object-cover pointer-events-none rounded-2xl"
              />
              
              {isActive && (
                <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded-full text-[9px] font-bold text-white tracking-wider">
                  {index + 1} / {imageUrls.length}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
