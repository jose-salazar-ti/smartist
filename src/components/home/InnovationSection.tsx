"use client";

import { useState } from "react";
import {
  Sparkles, RotateCw, ArrowRight,
  Truck, Star, Upload,
} from "lucide-react";
import dynamic from "next/dynamic";

const MugViewer3D = dynamic(() => import("@/components/3d/MugViewer3D"), { ssr: false });

/* ──────────────────────────────────────────────
   Design Options
────────────────────────────────────────────── */
const designOptions = [
  {
    id: "brand",
    label: "Marca / Logo",
    tag: "Corporativo",
    description: "Logo en ambos laterales",
    url: "/img/modelo_en_vivo/smartist_logo.svg",
    thumbnail: "/img/modelo_en_vivo/smartist_logo.svg",
    wrapMode: "both-sides" as const,
    ring: "ring-indigo-400",
    dot: "bg-indigo-500",
    tagColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
    glow: "from-indigo-500/20 to-purple-500/10",
  },
  {
    id: "design",
    label: "Diseño Personalizado",
    tag: "Diseño",
    description: "Arte a todo el ancho de la taza",
    url: "/img/modelo_en_vivo/personalizado.png",
    thumbnail: "/img/modelo_en_vivo/personalizado.png",
    wrapMode: "full-wrap" as const,
    ring: "ring-orange-500",
    dot: "bg-orange-600",
    tagColor: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
    glow: "from-orange-500/30 to-red-500/10",
  },
  {
    id: "photo",
    label: "Foto de Pareja",
    tag: "Dedicatoria",
    description: "Tu foto panorámica 20×9.5 cm",
    url: "/img/modelo_en_vivo/regalo_pareja.png",
    thumbnail: "/img/modelo_en_vivo/regalo_pareja.png",
    wrapMode: "full-wrap" as const,
    ring: "ring-amber-400",
    dot: "bg-amber-500",
    tagColor: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    glow: "from-amber-500/20 to-orange-500/10",
  },
];

/* ──────────────────────────────────────────────
   Component
────────────────────────────────────────────── */
export default function InnovationSection() {
  const [activeId, setActiveId] = useState("brand");
  const [customImage, setCustomImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomImage(url);
      setActiveId("custom");
    }
  };

  const active = activeId === "custom" && customImage
    ? {
        id: "custom",
        label: "Tu Propia Foto",
        tag: "Personalizado",
        description: "Tu imagen personalizada en 3D",
        url: customImage,
        thumbnail: customImage,
        wrapMode: "full-wrap" as const,
        ring: "ring-indigo-500",
        dot: "bg-indigo-500",
        tagColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
        glow: "from-indigo-500/20 to-purple-500/10",
      }
    : (designOptions.find((d) => d.id === activeId) ?? designOptions[0]);

  const isCustomActive = activeId === "custom";

  return (
    <section id="innovacion" className="py-20 relative overflow-hidden bg-(--bg-dark-3)/50 dark:bg-(--bg-dark-3)/30">
      {/* Hidden file input */}
      <input
        id="hero-file-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Ambient glows */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-400/8 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-[700px] h-[700px] bg-fuchsia-400/8 rounded-full blur-[160px] pointer-events-none" />

      <div className="container relative z-10">

        {/* ── Header ── */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="section-label mx-auto mb-5">
            <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
            Tecnología Smartist
          </div>
          <h2 className="font-heading font-extrabold text-3xl md:text-5xl text-slate-900 dark:text-white tracking-tight mb-4">
            Diseña tu taza{" "}
            <span className="bg-linear-to-r from-indigo-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
              en vivo, en 3D
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            Selecciona un estilo, gira la taza 360° y ve exactamente cómo quedará tu diseño.
          </p>
        </div>

        {/* ── 3D Viewer + Controls wrapper ── */}
        <div className="max-w-3xl mx-auto">

          {/* Viewer — frameless, floats on section bg */}
          <div className="relative h-[420px] md:h-[500px]">

            {/* Dynamic color glow behind the mug */}
            <div className={`absolute inset-0 bg-gradient-to-br ${active.glow} rounded-3xl pointer-events-none transition-all duration-700 blur-xl`} />

            {/* 3D Viewer — transparent canvas */}
            <div className="relative w-full h-full z-10">
              <MugViewer3D
                textureUrl={active.url}
                baseColor="#ffffff"
                wrapMode={active.wrapMode}
              />
            </div>

            {/* HUD — top left: active style tag */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${active.tagColor} shadow-sm backdrop-blur-sm`}>
                {active.tag}
              </span>
            </div>

            {/* HUD — top right: rotate hint */}
            <div className="absolute top-4 right-4 z-20 pointer-events-none">
              <div className="flex items-center gap-1.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-white/10 px-2.5 py-1.5 rounded-xl shadow-sm">
                <RotateCw className="h-3 w-3 text-indigo-500 animate-spin-slow" />
                <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                  Gira en 3D
                </span>
              </div>
            </div>

            {/* HUD — bottom center: active label */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border border-white/10">
                <span className={`w-1.5 h-1.5 rounded-full ${active.dot} animate-pulse`} />
                {active.label}
              </div>
            </div>

          </div>{/* end viewer */}

          {/* ── Thumbnail Row — glassmorphism ── */}
          <div className="mt-5 flex items-stretch gap-2.5 justify-center flex-wrap">
            {designOptions.map((opt) => {
              const isActive = activeId === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setActiveId(opt.id)}
                  className={`group flex flex-col items-center gap-2 p-2 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.06] active:scale-[0.97] w-[110px] md:w-[130px] ${
                    isActive
                      ? "bg-white/80 dark:bg-white/8 backdrop-blur-md border border-white/70 dark:border-white/15 shadow-xl shadow-slate-200/60 dark:shadow-black/30"
                      : "bg-white/40 dark:bg-white/4 backdrop-blur-sm border border-white/30 dark:border-white/[0.06] hover:bg-white/70 dark:hover:bg-white/8 hover:border-white/60"
                  }`}
                >
                  {/* Thumbnail — sin borde interno */}
                  <div className={`w-full aspect-video rounded-xl overflow-hidden transition-all duration-300 ${
                    isActive ? `ring-1 ring-offset-1 ring-offset-transparent ${opt.ring}` : ""
                  }`}>
                    <img
                      src={opt.thumbnail}
                      alt={opt.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Label + dot */}
                  <div className="flex items-center gap-1.5 w-full justify-center">
                    {isActive && (
                      <span className={`w-1.5 h-1.5 rounded-full ${opt.dot} shrink-0`} />
                    )}
                    <span className={`text-[10px] font-bold leading-tight text-center transition-colors ${
                      isActive
                        ? "text-slate-800 dark:text-white"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    }`}>
                      {opt.label}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Upload your own — glass CTA tile */}
            <button
              className={`group flex flex-col items-center gap-2 p-2 rounded-2xl cursor-pointer border transition-all duration-200 hover:scale-[1.06] active:scale-[0.97] w-[110px] md:w-[130px] ${
                isCustomActive
                  ? "bg-white/80 dark:bg-white/8 backdrop-blur-md border border-indigo-400 dark:border-indigo-400/30 shadow-xl shadow-indigo-200/20 dark:shadow-black/30"
                  : "bg-white/30 dark:bg-white/3 backdrop-blur-sm border border-dashed border-slate-300/60 dark:border-white/10 hover:border-indigo-400/60 hover:bg-indigo-50/40"
              }`}
              onClick={() => document.getElementById("hero-file-upload")?.click()}
            >
              <div className="w-full aspect-video rounded-xl flex items-center justify-center bg-linear-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-500/8 dark:to-purple-500/8 overflow-hidden relative">
                {customImage ? (
                  <img src={customImage} alt="Tu foto" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="h-5 w-5 text-indigo-400 group-hover:scale-110 group-hover:text-indigo-500 transition-all" />
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors text-center leading-tight">
                {customImage ? "Cambiar foto" : "Tu propia foto"}
              </span>
            </button>
          </div>{/* end thumbnails */}

          {/* ── Trust strip + CTA ── */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-white/6 bg-white/70 dark:bg-slate-900/40 backdrop-blur px-6 py-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                Optimización con IA
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-amber-500" />
                Envíos a todo el Perú
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-yellow-400" />
                98% satisfechos
              </span>
            </div>
            <a
              href={customImage ? `/regalos/crear?imageUrl=${encodeURIComponent(customImage)}` : "/productos"}
              className="shrink-0 inline-flex items-center gap-2 px-7 py-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
            >
              {customImage ? "¡Comprar con mi foto!" : "Diseñar mi Regalo"} <ArrowRight className="h-4 w-4" />
            </a>
          </div>{/* end trust strip */}

        </div>{/* end max-w-3xl */}

      </div>{/* end container */}
    </section>
  );
}
