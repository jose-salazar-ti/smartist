import { getProducts } from "@/services/products";
import ProductsSearchAndFilter from "./ProductsSearchAndFilter";
import ProductsList from "./ProductsList";
import { Suspense } from "react";
import { GradientSearchIcon, StepCartIcon } from "@/components/ui/icons";

export const revalidate = 0; // Disable cache to allow real-time changes

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <section style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '100vh' }}>
      <div className="container">
        
        {/* Header Section */}
        <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="section-label" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <StepCartIcon size={14} />
            <span>Catálogo Completo</span>
          </span>
          <h1 className="section-title" style={{ fontSize: '42px', margin: 0 }}>
            Explora nuestros <span className="gradient-text">Artículos</span>
          </h1>
          <p className="section-subtitle" style={{ margin: 0, maxWidth: '600px' }}>
            Personaliza tazas, camisetas, posavasos y fotorocas con tus propias fotos y textos usando nuestro visualizador en tiempo real.
          </p>
        </div>

        {/* Client Search & Category filter component wrapped in Suspense */}
        <Suspense fallback={<SearchAndFilterSkeleton />}>
          <ProductsSearchAndFilter />
        </Suspense>

        {/* Suspense products list */}
        <Suspense fallback={<LocalProductsSkeleton />}>
          <ProductsGrid searchParamsPromise={searchParams} />
        </Suspense>
        
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// Componente que realiza la carga de la base de datos
// -------------------------------------------------------------
async function ProductsGrid({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParamsPromise;
  const category = (resolvedParams.category as string) || "Todos";
  const search = (resolvedParams.search as string) || "";
  const customizable = resolvedParams.customizable === "true";

  // Fetch filtered products
  let products = await getProducts(category === "Todos" ? undefined : category, search);
  if (customizable) {
    products = products.filter(p => p.isCustomizable);
  }

  if (products.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '80px 20px', 
        background: 'var(--bg-card)', 
        border: '2px dashed var(--border)', 
        borderRadius: 'var(--radius-xl)', 
        textAlign: 'center' 
      }}>
        <div style={{ 
          width: '72px', 
          height: '72px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          border: '1px solid rgba(79, 70, 229, 0.2)',
          boxShadow: '0 8px 16px rgba(79, 70, 229, 0.05)'
        }}>
          <GradientSearchIcon />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>No encontramos productos</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, maxWidth: '400px' }}>
          Prueba buscando con otros términos o seleccionando otra categoría en la parte superior.
        </p>
      </div>
    );
  }

  return (
    <ProductsList products={products} />
  );
}

// -------------------------------------------------------------
// Esqueleto de productos local para Suspense
// -------------------------------------------------------------
function LocalProductsSkeleton() {
  return (
    <div className="products-grid">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="product-card" style={{ padding: '0', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div className="skeleton-shimmer animate-pulse" style={{ width: '100%', aspectRatio: '1/1', borderBottom: '1px solid rgba(255,255,255,0.05)' }}></div>
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
  );
}

// -------------------------------------------------------------
// Esqueleto de búsqueda y filtro
// -------------------------------------------------------------
function SearchAndFilterSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="skeleton-shimmer animate-pulse"
              style={{
                width: '120px',
                height: '38px',
                borderRadius: '99px',
                background: 'var(--bg-dark-3)',
                border: '1px solid var(--border)'
              }}
            />
          ))}
        </div>
        <div
          className="skeleton-shimmer animate-pulse"
          style={{
            width: '100%',
            maxWidth: '360px',
            height: '40px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-dark-3)',
            border: '1px solid var(--border)'
          }}
        />
      </div>
    </div>
  );
}


