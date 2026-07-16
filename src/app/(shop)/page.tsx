import { getProducts } from "@/services/products";
import HeroSection from "@/components/home/HeroSection";
import InnovationSection from "@/components/home/InnovationSection";
import AIEnhanceSection from "@/components/home/AIEnhanceSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import AudienceSection from "@/components/home/AudienceSection";
import InteractiveClient from "@/components/InteractiveClient";
import CTAWhatsAppButton from "@/components/home/CTAWhatsAppButton";
import { Suspense } from "react";
import { StepCartIcon, StepPaletteIcon, StepCardIcon, StepTruckIcon } from "@/components/ui/icons";

export const revalidate = 0; // Disable cache to allow real-time changes

export default function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <>
      <HeroSection />
      
      <InnovationSection />
      
      <AIEnhanceSection />
      
      <CategoriesSection />
      
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsList />
      </Suspense>
      
      <AudienceSection />

      {/* DEDICATION BANNER */}
      <section className="py-20 bg-gradient-to-br from-[var(--bg-dark-3)] via-[var(--bg-dark-2)] to-pink-50 dark:to-pink-950/20 text-slate-800 dark:text-slate-200 border-y border-[var(--border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--accent-rose)]/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-4 max-w-5xl text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/10 backdrop-blur-md">
            🎁 Regala con Inteligencia Emocional
          </span>
          
          <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight max-w-3xl mx-auto leading-tight text-slate-900 dark:text-white">
            Sorprende a tu persona favorita con una <span className="gradient-text">Dedicatoria Digital</span> gratis
          </h2>
          
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            ¿Vas a obsequiar una taza, gorra o camiseta? Acompáñala con un enlace personalizado que incluye tu mensaje, fotos y su canción de Spotify preferida. ¡Es gratis y súper fácil!
          </p>
          
          <div className="pt-4">
            <a 
              href="/regalos/crear" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[var(--primary-dark)] to-[var(--accent-rose)] hover:from-[var(--primary)] hover:to-[var(--accent-rose)] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[var(--primary)]/10 hover:shadow-[var(--primary)]/20 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              Diseñar Dedicatoria Gratis →
            </a>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works" id="como-funciona">
        <div className="container">
          <div className="how-it-works-header reveal">
            <div className="section-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              ¿Cómo funciona?
            </div>
            <h2 className="section-title">
              De tu idea a tu puerta en <span className="gradient-text">4 pasos</span>
            </h2>
            <p className="section-subtitle">
              El proceso más fácil para personalizar productos sublimados en Perú.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card reveal reveal-delay-1">
              <div className="step-number">
                <span className="step-icon">
                  <StepCartIcon />
                </span>
              </div>
              <h3 className="step-title">Elige tu producto</h3>
              <p className="step-desc">Explora nuestro catálogo y selecciona la base que quieres personalizar.</p>
            </div>

            <div className="step-card reveal reveal-delay-2">
              <div className="step-number">
                <span className="step-icon">
                  <StepPaletteIcon />
                </span>
              </div>
              <h3 className="step-title">Sube tu diseño</h3>
              <p className="step-desc">Carga tu imagen, foto o logo. Nuestro editor 2D te muestra cómo quedará al instante.</p>
            </div>

            <div className="step-card reveal reveal-delay-3">
              <div className="step-number">
                <span className="step-icon">
                  <StepCardIcon />
                </span>
              </div>
              <h3 className="step-title">Paga fácil</h3>
              <p className="step-desc">Yape, Plin o transferencia bancaria. Sube tu captura y listo, sin complicaciones.</p>
            </div>

            <div className="step-card reveal reveal-delay-4">
              <div className="step-number">
                <span className="step-icon">
                  <StepTruckIcon />
                </span>
              </div>
              <h3 className="step-title">Recibe tu pedido</h3>
              <p className="step-desc">Envíos a domicilio, despacho por courier o puntos de encuentro.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials" id="testimonios">
        <div className="container">
          <div className="testimonials-header reveal">
            <div className="section-label">
              💬 Testimonios
            </div>
            <h2 className="section-title">
              Lo que dicen nuestros <span className="gradient-text">clientes</span>
            </h2>
            <p className="section-subtitle">
              Más de 2,500 pedidos entregados con sonrisas garantizadas.
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card reveal reveal-delay-1">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Pedí 50 tazas con el logo de mi empresa para un evento y quedaron espectaculares. Los colores son vibrantes y la calidad de la cerámica es premium. Ya somos clientes recurrentes."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">MC</div>
                <div>
                  <div className="testimonial-name">María Castillo</div>
                  <div className="testimonial-role">Gerente de Marketing, TechPeru SAC</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card reveal reveal-delay-2">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Le regalé a mi novia una taza mágica con nuestras fotos para nuestro aniversario. Cuando vio que la imagen aparecía con el café caliente, se puso a llorar de emoción. ¡El mejor regalo!"
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">CR</div>
                <div>
                  <div className="testimonial-name">Carlos Ríos</div>
                  <div className="testimonial-role">Cliente frecuente, Lima</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card reveal reveal-delay-3">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Empecé vendiendo tazas personalizadas desde casa y ya es mi negocio principal. Smartist produce todo y yo solo me encargo de vender. Los márgenes son increíbles."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">LP</div>
                <div>
                  <div className="testimonial-name">Lucía Paredes</div>
                  <div className="testimonial-role">Emprendedora, Arequipa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-inner reveal">
            <div className="cta-content">
              <h2 className="cta-title">¿Listo para crear algo increíble?</h2>
              <p className="cta-subtitle">
                Empieza a personalizar tu primer producto hoy. Sin mínimos, sin complicaciones.
              </p>
              <div className="cta-actions">
                <a href="#catalogo" className="btn btn-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="19" cy="13" r="2"/><circle cx="7.5" cy="7.5" r="2"/><path d="M3.5 14.5A2.5 2.5 0 0 0 6 17h0a2.5 2.5 0 0 0 2.5-2.5"/><path d="m21 15.5-6 6"/><path d="m12 13-6.5 6.5"/><path d="m3 21 3.5-3.5"/></svg>
                  Empezar a Diseñar
                </a>
                <CTAWhatsAppButton />
                <div className="client-logos">
                  <InteractiveClient />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// -------------------------------------------------------------
// Componente de carga asíncrona (Suspense) para Productos
// -------------------------------------------------------------

async function ProductsList() {
  // Fetch featured products (destacado = true) up to 8
  let products = await getProducts(undefined, undefined, true, 8);
  
  // Fallback to latest 8 active products if no featured products are selected yet
  if (products.length === 0) {
    products = await getProducts(undefined, undefined, false, 8);
  }
  
  return <FeaturedProducts products={products} />;
}

// -------------------------------------------------------------
// Skeleton Loading Elegante para la cuadrícula de productos
// -------------------------------------------------------------

function ProductsSkeleton() {
  return (
    <section className="products" id="catalogo">
      <div className="container">
        <div className="products-header">
          <div>
            <div className="section-label skeleton-shimmer" style={{ width: '100px', height: '24px', borderRadius: '12px' }}></div>
            <h2 className="section-title skeleton-shimmer" style={{ width: '300px', height: '40px', marginTop: '16px', borderRadius: '8px' }}></h2>
            <p className="section-subtitle skeleton-shimmer" style={{ width: '250px', height: '20px', marginTop: '12px', borderRadius: '8px' }}></p>
          </div>
          <div className="products-filters" style={{ gap: '10px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton-shimmer" style={{ width: '80px', height: '40px', borderRadius: '20px' }}></div>
            ))}
          </div>
        </div>

        <div className="products-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="product-card" style={{ padding: '0', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
              {/* Imagen */}
              <div className="skeleton-shimmer" style={{ width: '100%', aspectRatio: '1/1', borderBottom: '1px solid rgba(255,255,255,0.05)' }}></div>
              {/* Contenido */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="skeleton-shimmer" style={{ width: '40%', height: '14px', borderRadius: '4px' }}></div>
                <div className="skeleton-shimmer" style={{ width: '80%', height: '24px', borderRadius: '6px' }}></div>
                <div className="skeleton-shimmer" style={{ width: '100%', height: '16px', borderRadius: '4px' }}></div>
                <div className="skeleton-shimmer" style={{ width: '60%', height: '16px', borderRadius: '4px' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                  <div className="skeleton-shimmer" style={{ width: '30%', height: '28px', borderRadius: '6px' }}></div>
                  <div className="skeleton-shimmer" style={{ width: '40%', height: '36px', borderRadius: '18px' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
