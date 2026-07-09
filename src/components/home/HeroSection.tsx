"use client";

import { useState, useEffect } from "react";

export default function HeroSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Activar animación de entrada después del montaje
    const loadTimer = setTimeout(() => setIsLoaded(true), 150);

    const handleMouseMove = (e: MouseEvent) => {
      // Normalizar coordenadas del cursor entre -1 y 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      clearTimeout(loadTimer);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <div className="hero-grid"></div>
      </div>

      <div className="container">
        <div className="hero-content">
          <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6.5px' }}>
            <span className="dot" style={{ background: 'var(--primary, #6366f1)' }}></span>
            ✨ Visualizador en Vivo 3D & Optimización de Imagen
          </div>

          <h1 className="hero-title">
            Tu regalo perfecto, <br />
            <span className="gradient-text">diseñado en 3D</span>
          </h1>

          <p className="hero-description">
            Personaliza tazas, camisetas y más en tiempo real. 
            Gira tu producto en 360° y ve el resultado exacto antes de recibirlo.
          </p>

          <div className="hero-actions">
            <a href="/productos" className="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
              Diseñar mi Regalo
            </a>
            <a href="#como-funciona" className="btn btn-outline">
              ¿Cómo funciona? →
            </a>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">2,500+</span>
              <span className="hero-stat-label">Pedidos entregados</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">98%</span>
              <span className="hero-stat-label">Clientes satisfechos</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">24h</span>
              <span className="hero-stat-label">Producción express</span>
            </div>
          </div>
        </div>

        <div className="hero-showcase relative w-full h-[500px] flex items-center justify-center">
          {/* Central radial glow background */}
          <div className="absolute w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Product 1: Manchester United (Center-Right/Upper) */}
          <div 
            className="absolute w-[20%] max-w-[140px] min-w-[85px] aspect-square transition-all ease-out"
            style={{ 
              top: '8%', 
              left: '46%',
              transform: isLoaded 
                ? `translate(${mousePos.x * 8}px, ${mousePos.y * 8}px) scale(1)` 
                : 'translate(0px, 120px) scale(0.2)',
              opacity: isLoaded ? 1 : 0,
              filter: isLoaded ? 'blur(0px)' : 'blur(12px)',
              transitionDuration: isLoaded ? '600ms' : '1200ms',
              transitionDelay: isLoaded ? '0ms' : '100ms',
              zIndex: 10
            }}
          >
            <a 
              href="/productos/taza-blanca-11-oz"
              className="block w-full h-full cursor-pointer group relative"
              style={{ animation: 'float 5s ease-in-out infinite' }}
            >
              <img src="/img/imagen_inicio/cilindrico.png" alt="Termo Manchester" className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:scale-115 group-hover:drop-shadow-[0_20px_35px_rgba(239,68,68,0.45)]" />
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/95 text-white text-[10px] px-2.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none border border-white/10 font-semibold tracking-wide">
                Personalizar 🎨
              </span>
            </a>
          </div>

          {/* Product 2: Stitch (Left/Lower) */}
          <div 
            className="absolute w-[18%] max-w-[125px] min-w-[80px] aspect-square transition-all ease-out"
            style={{ 
              top: '40%', 
              left: '4%',
              transform: isLoaded 
                ? `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px) scale(1)` 
                : 'translate(-50px, 150px) scale(0.2)',
              opacity: isLoaded ? 1 : 0,
              filter: isLoaded ? 'blur(0px)' : 'blur(12px)',
              transitionDuration: isLoaded ? '600ms' : '1200ms',
              transitionDelay: isLoaded ? '0ms' : '250ms',
              zIndex: 20
            }}
          >
            <a 
              href="/productos/taza-blanca-11-oz"
              className="block w-full h-full cursor-pointer group relative"
              style={{ animation: 'float-slow 6s ease-in-out infinite 0.5s' }}
            >
              <img src="/img/imagen_inicio/termobotella.png" alt="Termo Stitch" className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)] transition-all duration-300 group-hover:scale-115 group-hover:drop-shadow-[0_20px_35px_rgba(59,130,246,0.45)]" />
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/95 text-white text-[10px] px-2.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none border border-white/10 font-semibold tracking-wide">
                Personalizar 🎨
              </span>
            </a>
          </div>

          {/* Product 3: Alianza (Right/Middle) */}
          <div 
            className="absolute w-[19%] max-w-[135px] min-w-[90px] aspect-square transition-all ease-out"
            style={{ 
              top: '20%', 
              left: '62%',
              transform: isLoaded 
                ? `translate(${mousePos.x * 14}px, ${mousePos.y * 14}px) scale(1)` 
                : 'translate(50px, 100px) scale(0.2)',
              opacity: isLoaded ? 1 : 0,
              filter: isLoaded ? 'blur(0px)' : 'blur(12px)',
              transitionDuration: isLoaded ? '600ms' : '1200ms',
              transitionDelay: isLoaded ? '0ms' : '400ms',
              zIndex: 16
            }}
          >
            <a 
              href="/productos/taza-blanca-11-oz"
              className="block w-full h-full cursor-pointer group relative"
              style={{ animation: 'float-slow 7s ease-in-out infinite 1s' }}
            >
              <img src="/img/imagen_inicio/termoauto.png" alt="Termoauto Alianza" className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)] transition-all duration-300 group-hover:scale-115 group-hover:drop-shadow-[0_20px_35px_rgba(30,58,138,0.5)]" />
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/95 text-white text-[10px] px-2.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none border border-white/10 font-semibold tracking-wide">
                Personalizar 🎨
              </span>
            </a>
          </div>

          {/* Product 4: Flork (Left/Middle) */}
          <div 
            className="absolute w-[17%] max-w-[115px] min-w-[75px] aspect-square transition-all ease-out"
            style={{ 
              top: '22%', 
              left: '18%',
              transform: isLoaded 
                ? `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px) scale(1)` 
                : 'translate(-80px, 80px) scale(0.2)',
              opacity: isLoaded ? 1 : 0,
              filter: isLoaded ? 'blur(0px)' : 'blur(12px)',
              transitionDuration: isLoaded ? '600ms' : '1200ms',
              transitionDelay: isLoaded ? '0ms' : '550ms',
              zIndex: 12
            }}
          >
            <a 
              href="/productos/taza-blanca-11-oz"
              className="block w-full h-full cursor-pointer group relative"
              style={{ animation: 'float 8s ease-in-out infinite 0.2s' }}
            >
              <img src="/img/imagen_inicio/tomatodo.png" alt="Tomatodo Flork" className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:scale-115 group-hover:drop-shadow-[0_20px_35px_rgba(168,85,247,0.4)]" />
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/95 text-white text-[10px] px-2.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none border border-white/10 font-semibold tracking-wide">
                Personalizar 🎨
              </span>
            </a>
          </div>

          {/* Product 5: Perro (Center-Left/Upper) */}
          <div 
            className="absolute w-[18%] max-w-[125px] min-w-[80px] aspect-square transition-all ease-out"
            style={{ 
              top: '6%', 
              left: '32%',
              transform: isLoaded 
                ? `translate(${mousePos.x * 8}px, ${mousePos.y * 8}px) scale(1)` 
                : 'translate(-40px, 50px) scale(0.2)',
              opacity: isLoaded ? 1 : 0,
              filter: isLoaded ? 'blur(0px)' : 'blur(12px)',
              transitionDuration: isLoaded ? '600ms' : '1200ms',
              transitionDelay: isLoaded ? '0ms' : '700ms',
              zIndex: 10
            }}
          >
            <a 
              href="/productos/taza-blanca-11-oz"
              className="block w-full h-full cursor-pointer group relative"
              style={{ animation: 'float-slow 5.5s ease-in-out infinite 0.7s' }}
            >
              <img src="/img/imagen_inicio/deportivo.png" alt="Tomatodo Perro" className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:scale-115 group-hover:drop-shadow-[0_20px_35px_rgba(16,185,129,0.4)]" />
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/95 text-white text-[10px] px-2.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none border border-white/10 font-semibold tracking-wide">
                Personalizar 🎨
              </span>
            </a>
          </div>

          {/* Product 6: Plato (Center/Lower) */}
          <div 
            className="absolute w-[25%] max-w-[170px] min-w-[110px] aspect-square transition-all ease-out"
            style={{ 
              top: '52%', 
              left: '38%',
              transform: isLoaded 
                ? `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px) scale(1)` 
                : 'translate(0px, 180px) scale(0.2)',
              opacity: isLoaded ? 1 : 0,
              filter: isLoaded ? 'blur(0px)' : 'blur(12px)',
              transitionDuration: isLoaded ? '600ms' : '1200ms',
              transitionDelay: isLoaded ? '0ms' : '850ms',
              zIndex: 15
            }}
          >
            <a 
              href="/productos/taza-blanca-11-oz"
              className="block w-full h-full cursor-pointer group relative"
              style={{ animation: 'float 6.5s ease-in-out infinite 1.2s' }}
            >
              <img src="/img/imagen_inicio/plato.png" alt="Plato Personalizado" className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)] transition-all duration-300 group-hover:scale-115 group-hover:drop-shadow-[0_20px_35px_rgba(245,158,11,0.45)]" />
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/95 text-white text-[10px] px-2.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none border border-white/10 font-semibold tracking-wide">
                Personalizar 🎨
              </span>
            </a>
          </div>

          {/* Product 7: Taza 11oz (Right/Lower) */}
          <div 
            className="absolute w-[21%] max-w-[140px] min-w-[85px] aspect-square transition-all ease-out"
            style={{ 
              top: '38%', 
              left: '78%',
              transform: isLoaded 
                ? `translate(${mousePos.x * 22}px, ${mousePos.y * 22}px) scale(1)` 
                : 'translate(80px, 150px) scale(0.2)',
              opacity: isLoaded ? 1 : 0,
              filter: isLoaded ? 'blur(0px)' : 'blur(12px)',
              transitionDuration: isLoaded ? '600ms' : '1200ms',
              transitionDelay: isLoaded ? '0ms' : '1000ms',
              zIndex: 25
            }}
          >
            <a 
              href="/productos/taza-blanca-11-oz"
              className="block w-full h-full cursor-pointer group relative"
              style={{ animation: 'float 5.8s ease-in-out infinite 1.5s' }}
            >
              <img src="/img/imagen_inicio/taza_11oz.png" alt="Taza 11oz Personalizada" className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)] transition-all duration-300 group-hover:scale-115 group-hover:drop-shadow-[0_20px_35px_rgba(99,102,241,0.45)]" />
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/95 text-white text-[10px] px-2.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none border border-white/10 font-semibold tracking-wide">
                Personalizar 🎨
              </span>
            </a>
          </div>

          {/* Floating Info Cards */}
          <div 
            className="hero-floating-card card-1 z-30 transition-all ease-out"
            style={{ 
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
              transitionDuration: '800ms',
              transitionDelay: isLoaded ? '0ms' : '1100ms',
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px'
            }}
          >
            <div className="floating-icon purple" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Visualizador 3D</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Personaliza en vivo</div>
            </div>
          </div>

          <div 
            className="hero-floating-card card-2 z-30 transition-all ease-out"
            style={{ 
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
              transitionDuration: '800ms',
              transitionDelay: isLoaded ? '0ms' : '1250ms',
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px'
            }}
          >
            <div className="floating-icon green" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="16" y1="16" x2="16.01" y2="16"></line></svg>
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Optimizado con IA</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Impresión HD nítida</div>
            </div>
          </div>

          <div 
            className="hero-floating-card card-3 z-30 transition-all ease-out"
            style={{ 
              bottom: '20px', 
              top: 'auto', 
              right: '-40px',
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
              transitionDuration: '800ms',
              transitionDelay: isLoaded ? '0ms' : '1400ms',
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px'
            }}
          >
            <div className="floating-icon rose" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Envíos Seguros</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>A todo el Perú</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

