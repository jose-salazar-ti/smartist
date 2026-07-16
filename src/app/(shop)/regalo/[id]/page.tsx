"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Heart, Gift, Sparkles, Music, Loader2, Play, Volume2, ArrowRight, ArrowLeft, Share2
} from "lucide-react";
import { getCategoryIconByKey } from "@/components/ui/icons";
import { SpotifyPlayerPremium } from "@/components/ui/SpotifyPlayerPremium";
import { StackedPhotos } from "@/components/ui/StackedPhotos";

export default function VerRegaloPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  
  // Animation / Unboxing state
  const [unboxed, setUnboxed] = useState(false);
  const [wobbling, setWobbling] = useState(false);
  const [opening, setOpening] = useState(false);

  // Load Dedication Data
  useEffect(() => {
    if (!id) return;

    const fetchDedication = async () => {
      try {
        const res = await fetch(`/api/dedicatorias?id=${id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          const err = await res.json();
          setError(err.error || "No se encontró esta dedicatoria.");
        }
      } catch (err) {
        console.error(err);
        setError("Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchDedication();
  }, [id]);

  // Wobble interval for the gift box
  useEffect(() => {
    if (unboxed) return;
    const interval = setInterval(() => {
      setWobbling(true);
      setTimeout(() => setWobbling(false), 1000);
    }, 3000);
    return () => clearInterval(interval);
  }, [unboxed]);

  const handleOpenGift = () => {
    setOpening(true);
    setTimeout(() => {
      setUnboxed(true);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-sm font-semibold text-slate-400">Cargando tu sorpresa...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
          <Heart className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold mb-2">¡Oh, no!</h1>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          {error || "No pudimos encontrar esta dedicatoria sorpresa. Verifica el enlace de WhatsApp."}
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 h-11 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl transition-all"
        >
          Ir al Inicio
        </button>
      </div>
    );
  }

  const { remitente, destinatario, mensaje, imagenUrl, spotifyUri, patronKey, bgColor, pedido } = data;
  
  // Parse pattern key and multi-image list
  const [actualPatronKey, visualizerType] = (patronKey || "corazones").split(":");
  const imageUrls = imagenUrl ? imagenUrl.split(",") : [];
  
  const isDarkBg = bgColor === "#1e1e24" || !bgColor || bgColor === "default";

  // Map background colors to gradient classes
  const getBgGradient = (color?: string | null) => {
    switch (color) {
      case "#fdf8f5":
        return "from-[#fdf8f5] to-[#f4ebe6]";
      case "#fff0f6":
        return "from-[#fff0f6] to-[#ffd8e6]";
      case "#f0f4ff":
        return "from-[#f0f4ff] to-[#d6e4ff]";
      case "#e6fcf5":
        return "from-[#e6fcf5] to-[#c3fae8]";
      case "#1e1e24":
        return "from-[#22222b] via-[#1a1a20] to-[#0e0e12]";
      default:
        // Default Sweet Lilac/Pink gradient from mockup!
        return "from-[#8a63e5] via-[#a356db] to-[#c949c8]";
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Sorpresa para ${destinatario}`,
        text: `Mira esta hermosa dedicatoria que te envió ${remitente}`,
        url: window.location.href
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("¡Enlace copiado al portapapeles! 🎁");
    }
  };

  return (
    <main className="min-h-screen w-full bg-slate-950 overflow-hidden relative flex items-center justify-center font-sans">
      
      {/* 1. Unboxing Stage (Virtual wrapping paper box) */}
      {!unboxed && (
        <div className={`absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-950 z-50 flex flex-col items-center justify-center p-6 text-center transition-all duration-1000 ${opening ? "opacity-0 scale-110 pointer-events-none" : "opacity-100"}`}>
          <div className="max-w-xs mx-auto space-y-6">
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-white tracking-tight">
              ¡Tienes una sorpresa! 🎁
            </h1>
            <p className="text-xs text-slate-350 leading-relaxed">
              De parte de <span className="font-bold text-indigo-400">{remitente}</span>. Toca la caja para desenvolver tu regalo sorpresa.
            </p>

            {/* Gift Box Wobble Container */}
            <button
              onClick={handleOpenGift}
              disabled={opening}
              className={`relative focus:outline-none cursor-pointer select-none group transition-transform ${wobbling ? "animate-bounce" : ""} ${opening ? "scale-50 rotate-12" : "hover:scale-105"}`}
            >
              <div className="relative w-44 h-44 flex items-center justify-center">
                
                {/* Glow ring */}
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full group-hover:bg-indigo-500/30 transition-all duration-300" />
                
                {/* Gift SVG */}
                <Gift className="w-32 h-32 text-indigo-400 group-hover:text-indigo-300 transition-colors animate-pulse" />
              </div>
            </button>

            <p className="text-[10px] text-slate-500 uppercase tracking-widest animate-pulse">
              Haz clic en la caja para abrir
            </p>
          </div>
        </div>
      )}

      {/* 2. Interactive Dedication View Stage */}
      <div 
        className={`w-full min-h-screen relative flex items-center justify-center p-4 sm:p-6 transition-all duration-1000 overflow-y-auto bg-gradient-to-b ${getBgGradient(bgColor)}`}
      >
        
        {/* Dynamic Pattern Tiled Backdrop */}
        <div className="absolute inset-0 pointer-events-none grid grid-cols-8 sm:grid-cols-10 md:grid-cols-16 gap-x-4 gap-y-8 p-3 overflow-hidden">
          {Array.from({ length: 120 }).map((_, i) => {
            const iconKey = actualPatronKey === "cats-hearts" 
              ? (i % 2 === 0 ? "cat" : "heart") 
              : actualPatronKey;
            return (
              <div 
                key={i} 
                className={`flex items-center justify-center ${
                  bgColor === "#1e1e24" ? "text-white/15" : "text-indigo-950/15"
                }`}
              >
                {getCategoryIconByKey(iconKey, { size: 14 })}
              </div>
            );
          })}
        </div>

        {/* Floating Glassmorphism Panels Layout */}
        <div className="relative z-10 w-full max-w-md flex flex-col gap-6 my-8 px-2 items-center">
          
          {/* Top Header Card (Glassmorphism Bubble) */}
          <div className={`backdrop-blur-xl border rounded-3xl p-4 shadow-xl w-full flex items-center justify-between ${
            isDarkBg 
              ? "bg-white/20 border-white/30 text-white" 
              : "bg-indigo-950/5 border-indigo-950/10 text-indigo-950"
          }`}>
            <button 
              onClick={() => router.push("/")} 
              className={`hover:scale-105 transition-all p-2 rounded-xl border shadow-sm cursor-pointer ${
                isDarkBg ? "text-white bg-white/10 border-white/20" : "text-indigo-950 bg-indigo-950/5 border-indigo-950/10"
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex-1 text-center px-3">
              <h2 className={`text-base font-extrabold tracking-tight drop-shadow-sm leading-tight flex items-center justify-center gap-1 ${
                isDarkBg ? "text-white" : "text-indigo-950"
              }`}>
                ¡Para {destinatario} con Amor! <Sparkles className="h-3.5 w-3.5 fill-current animate-pulse opacity-85" />
              </h2>
              <p className={`text-[10px] font-medium mt-0.5 ${isDarkBg ? "text-white/95" : "text-indigo-900/70"}`}>
                De parte de: <span className="font-extrabold">{remitente}</span>
              </p>
            </div>
            <button 
              onClick={handleShare} 
              className={`hover:scale-105 transition-all p-2 rounded-xl border shadow-sm cursor-pointer ${
                isDarkBg ? "text-white bg-white/10 border-white/20" : "text-indigo-950 bg-indigo-950/5 border-indigo-950/10"
              }`}
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Photo Stack Gallery */}
          {imageUrls.length > 0 && (
            <div className="w-full overflow-visible">
              <StackedPhotos imageUrls={imageUrls} mode={visualizerType as any} />
            </div>
          )}

          {/* Bottom Card: Message & Music Player */}
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/30 dark:border-white/10 rounded-3xl p-5 shadow-2xl w-full space-y-4">
            <p className="text-sm font-semibold text-purple-950 dark:text-purple-100 leading-relaxed text-center italic font-serif py-1 px-2 relative">
              <span className="text-lg font-bold text-fuchsia-400 opacity-60 absolute -top-1.5 left-0">“</span>
              {mensaje}
              <span className="text-lg font-bold text-fuchsia-400 opacity-60 absolute -bottom-3 right-0">”</span>
            </p>

            {/* Audio Player (Spotify / YouTube / MP3) */}
            {spotifyUri && unboxed && (
              <div className="pt-2 border-t border-purple-100/50 dark:border-white/5 w-full">
                {spotifyUri.startsWith("youtube:") ? (
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-white/10 aspect-video w-full bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${spotifyUri.substring(8)}?autoplay=1&mute=0&enablejsapi=1&modestbranding=1&rel=0`}
                      title="YouTube Music Video"
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <SpotifyPlayerPremium spotifyUri={spotifyUri} autoPlay={true} />
                )}
              </div>
            )}
          </div>

          {/* Conversion CTA Loop */}
          <div className="bg-linear-to-br from-indigo-600 to-violet-600 rounded-3xl p-5 text-center text-white shadow-xl shadow-indigo-600/25 w-full">
            <p className="text-xs font-extrabold tracking-wider uppercase mb-1">¿Te encantó tu detalle?</p>
            <p className="text-[11px] opacity-90 leading-tight mb-4">
              Tú también puedes diseñar un regalo 3D personalizado con dedicatoria interactiva gratis en Smartist.
            </p>
            <button
              onClick={() => router.push("/productos")}
              className="w-full flex items-center justify-center gap-2 h-11 bg-white hover:bg-slate-50 text-indigo-600 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer border-none"
            >
              Crear Regalo Personalizado <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>
    </main>
  );
}

// Minimalist Rotation Icon component
function RefreshCwIcon({ size = 10, ...props }: { size?: number; [key: string]: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
