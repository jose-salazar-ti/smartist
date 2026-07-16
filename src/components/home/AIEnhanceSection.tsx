"use client";

import { useState } from "react";
import {
  Sparkles, ArrowRight, CheckCircle2,
  ScanLine, Palette, Focus, ZoomIn,
} from "lucide-react";

const BEFORE_IMG = "/img/foto_borrosa/borroso.png";
const AFTER_IMG  = "/img/foto_borrosa/borroso.png";

const benefits = [
  {
    icon: Focus,
    title: "Nitidez HD garantizada",
    desc: "Eliminamos el desenfoque para que cada píxel luzca perfecto al imprimirse.",
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
  },
  {
    icon: Palette,
    title: "Colores vibrantes",
    desc: "Corregimos la saturación y contraste para que los colores se vean vivos en la taza.",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
  },
  {
    icon: ScanLine,
    title: "Encuadre perfecto",
    desc: "Centramos y ajustamos tu imagen para que se adapte al área de impresión.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    icon: ZoomIn,
    title: "Mejora de detalles",
    desc: "Recuperamos detalles perdidos en imágenes enviadas por WhatsApp o redes.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
];

export default function AIEnhanceSection() {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(x, 2), 98));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(x, 2), 98));
  };

  return (
    <section
      id="mejora-ia"
      className="py-20 relative overflow-hidden bg-(--bg-dark-2)"
    >
      {/* Ambient glows */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-rose-400/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-purple-400/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── LEFT: Before / After Slider ── */}
          <div className="order-2 lg:order-1">
            <div
              className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/7 shadow-2xl shadow-slate-200/60 dark:shadow-black/40 cursor-ew-resize select-none h-[380px] md:h-[460px] bg-slate-100"
              onMouseMove={handleMouseMove}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchMove={handleTouchMove}
            >
              {/* ── AFTER layer (sharp, vivid) ── */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <img
                  src={AFTER_IMG}
                  alt="Foto mejorada con IA"
                  className="absolute top-0 left-0 w-full h-full object-cover object-center"
                  style={{ filter: "saturate(1.25) contrast(1.08) brightness(1.05)" }}
                  draggable={false}
                />
                {/* Label */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  <CheckCircle2 className="h-3 w-3" /> Optimizada
                </div>
              </div>

              {/* ── BEFORE layer (clipped, blurry, desaturated) ── */}
              <div
                className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none transition-none"
                style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
              >
                {/* The image is rendered normally so it aligns perfectly with the AFTER layer */}
                <img
                  src={BEFORE_IMG}
                  alt="Foto original"
                  className="absolute top-0 left-0 w-full h-full object-cover object-center"
                  draggable={false}
                />
                {/* A backdrop-filter overlay applies the blur and color changes without affecting the image bounds or causing Chromium compositing shifts */}
                <div 
                  className="absolute top-0 left-0 w-full h-full" 
                  style={{ backdropFilter: "blur(2.5px) saturate(0.45) brightness(0.88)", WebkitBackdropFilter: "blur(2.5px) saturate(0.45) brightness(0.88)" }} 
                />
                
                {/* Label */}
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-slate-700/90 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Original
                </div>
              </div>

              {/* ── Drag Handle ── */}
              <div
                className="absolute top-0 bottom-0 flex items-center justify-center pointer-events-none -translate-x-1/2"
                style={{ left: `${sliderPos}%` }}
              >
                {/* Line */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-lg" />
                {/* Circle button */}
                <div className="relative z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-white/80 shadow-xl flex items-center justify-center ring-2 ring-indigo-400/30">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-600 dark:text-white">
                    <path d="M8 9l-4 3 4 3M16 9l4 3-4 3" />
                  </svg>
                </div>
              </div>

              {/* ── Instruction hint ── */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest pointer-events-none">
                Desliza para comparar
              </div>
            </div>

            {/* Caption */}
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
              Ejemplo de optimización aplicada a una foto real de cliente
            </p>
          </div>

          {/* ── RIGHT: Copy & Benefits ── */}
          <div className="order-1 lg:order-2">
            {/* Section label */}
            <div className="section-label mb-5 inline-flex">
              <Sparkles className="h-4 w-4 text-rose-500 animate-pulse" />
              Optimización Profesional con IA
            </div>

            {/* Title */}
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl xl:text-5xl text-slate-900 dark:text-white tracking-tight mb-5 leading-tight">
              Tu foto borrosa,{" "}
              <span className="bg-linear-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                mejorada con IA
              </span>{" "}
              antes de imprimir
            </h2>

            {/* Description */}
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-8">
              No importa si tu foto es de baja resolución o tiene colores apagados — nuestro sistema de IA analiza y optimiza tu imagen automáticamente para garantizar una impresión nítida y vibrante.
            </p>

            {/* Benefits grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {benefits.map(({ icon: Icon, title, desc, color, bg }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 hover:border-slate-200 dark:hover:border-white/10 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-0.5">{title}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a
                href="/productos"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-linear-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-400 hover:via-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
              >
                Diseñar mi Regalo <ArrowRight className="h-4 w-4" />
              </a>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Optimización incluida en cada pedido
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
