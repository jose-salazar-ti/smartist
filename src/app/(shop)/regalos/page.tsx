import { getProducts } from "@/services/products";
import GiftFilterSection from "./GiftFilterSection";
import { Suspense } from "react";

export const revalidate = 0; // Disable cache to allow real-time changes

export default function RegalosPage() {
  return (
    <section style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '100vh', background: 'radial-gradient(circle at top, var(--bg-dark-2) 0%, var(--bg-dark) 80%)' }}>
      <div className="container">
        
        {/* Header Section */}
        <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="section-label" style={{ alignSelf: 'flex-start' }}>
            🎁 Buscador de Ideas
          </span>
          <h1 className="section-title" style={{ fontSize: '42px', margin: 0 }}>
            Encuentra el <span className="gradient-text">Regalo Perfecto</span>
          </h1>
          <p className="section-subtitle" style={{ margin: 0, maxWidth: '600px' }}>
            ¿No sabes qué regalar? Utiliza nuestro filtro por destinatario o presupuesto para encontrar tazas, posavasos, rompecabezas o fotorocas ideales.
          </p>
        </div>

        {/* Dynamic Interactive Filter & Results Grid inside Suspense */}
        <Suspense fallback={<LocalGiftSkeleton />}>
          <GiftFilterContainer />
        </Suspense>
        
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// Contenedor asíncrono para cargar los productos
// -------------------------------------------------------------
async function GiftFilterContainer() {
  const products = await getProducts();
  return <GiftFilterSection products={products} />;
}

// -------------------------------------------------------------
// Esqueleto de carga para la sección de regalos
// -------------------------------------------------------------
function LocalGiftSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      {/* Gift Filters Skeleton */}
      <div style={{ 
        width: '100%', 
        background: 'rgba(15, 23, 42, 0.4)', 
        border: '1px solid rgba(255, 255, 255, 0.05)', 
        padding: '24px', 
        borderRadius: '24px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px' 
      }}>
        <div className="skeleton-shimmer animate-pulse" style={{ height: '20px', width: '176px', borderRadius: '4px' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-shimmer animate-pulse" style={{ height: '40px', width: '112px', borderRadius: '12px' }} />
          ))}
        </div>
      </div>

      {/* Gift Catalog Grid Skeleton */}
      <div className="products-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="product-card" style={{ padding: '0', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
            <div className="skeleton-shimmer animate-pulse" style={{ width: '100%', aspectRatio: '1/1', borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="skeleton-shimmer animate-pulse" style={{ width: '40%', height: '14px', borderRadius: '4px' }}></div>
              <div className="skeleton-shimmer animate-pulse" style={{ width: '80%', height: '24px', borderRadius: '6px' }}></div>
              <div className="skeleton-shimmer animate-pulse" style={{ width: '100%', height: '16px', borderRadius: '4px' }}></div>
              <div className="skeleton-shimmer animate-pulse" style={{ width: '60%', height: '16px', borderRadius: '4px' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <div className="skeleton-shimmer animate-pulse" style={{ width: '30%', height: '28px', borderRadius: '6px' }}></div>
                <div className="skeleton-shimmer animate-pulse" style={{ width: '40%', height: '36px', borderRadius: '18px' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

