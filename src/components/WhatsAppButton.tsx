"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function WhatsAppButton() {
  const [phoneNumber, setPhoneNumber] = useState("51999999999");
  const [showTooltip, setShowTooltip] = useState(true);
  const pathname = usePathname();
  const [hasBottomBar, setHasBottomBar] = useState(false);

  useEffect(() => {
    // Elevate button only on product customizer pages where bottom bar is present
    const isProductDetail = pathname && pathname.startsWith("/productos/") && pathname !== "/productos";
    setHasBottomBar(!!isProductDetail);
  }, [pathname]);

  useEffect(() => {
    async function loadWhatsapp() {
      try {
        const res = await fetch("/api/admin/ajustes");
        if (res.ok) {
          const data = await res.json();
          if (data.whatsappNumber) {
            setPhoneNumber(data.whatsappNumber);
          }
        }
      } catch (err) {
        console.error("Failed to load whatsapp setting", err);
      }
    }
    loadWhatsapp();

    // Auto-hide tooltip after 12 seconds to keep the UI clean
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  const defaultMessage = encodeURIComponent(
    "¡Hola Smartist! Quisiera consultar sobre la personalización de un producto."
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <div className={`fixed ${hasBottomBar ? "bottom-24" : "bottom-6"} md:bottom-6 right-6 z-50 flex items-center gap-3`}>
      {/* CSS Animación Local */}
      <style jsx global>{`
        @keyframes float-slide {
          0% {
            opacity: 0;
            transform: translateX(10px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .animate-float-slide {
          animation: float-slide 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Premium Glassmorphic Tooltip */}
      {showTooltip && (
        <div className="animate-float-slide relative flex flex-col bg-slate-950/95 text-white p-3.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 backdrop-blur-md w-64 md:w-72 select-none">
          {/* Arrow pointing to WhatsApp button */}
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-950 border-r border-t border-white/10 rotate-45" />
          
          <div className="flex flex-col gap-1 pr-4">
            {/* Header / Active Status */}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                ¿Necesitas ayuda?
              </span>
            </div>
            
            {/* Main Message */}
            <span className="text-slate-100 text-xs md:text-sm font-medium leading-relaxed mt-0.5">
              ¡Olvídate de los bots! Escríbenos directo 💬
            </span>
          </div>

          {/* Premium Close button */}
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer text-[9px] border border-white/5"
            aria-label="Cerrar mensaje"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_40px_rgba(37,211,102,0.65)] border border-white/20 transition-all duration-300 hover:scale-110 hover:-translate-y-1 group cursor-pointer"
        aria-label="Contactar por WhatsApp"
      >
        {/* Outer pulsing ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" />

        {/* Circular Image Container to clip square corners without cutting off the pulse */}
        <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center">
          {/* Custom WhatsApp Icon Image */}
          <img 
            src="/img/icono_whatsapp.png" 
            alt="WhatsApp" 
            className="w-full h-full object-cover group-hover:rotate-12 transition-transform duration-300" 
          />
        </div>
      </a>
    </div>
  );
}
