"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Gift, Heart, Briefcase, Sparkles, SlidersHorizontal, ArrowRight } from "lucide-react";
import type { Product } from "@/services/product-types";
import { useFavoritesStore } from "@/store/favoritesStore";

interface Props {
  products: Product[];
}

export default function GiftFilterSection({ products }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const favorites = useFavoritesStore((state) => state.favorites);
  const [favoritesMounted, setFavoritesMounted] = useState(false);

  useEffect(() => {
    setFavoritesMounted(true);
  }, []);

  const isFav = (id: string) => favoritesMounted && favorites.includes(id);

  // URL states
  const initialTheme = searchParams.get("recipient") || "todos";
  const initialBudget = searchParams.get("budget") || "todos";

  const [activeTheme, setActiveTheme] = useState(initialTheme);
  const [activeBudget, setActiveBudget] = useState(initialBudget);

  // Sync state with URL params
  useEffect(() => {
    setActiveTheme(searchParams.get("recipient") || "todos");
    setActiveBudget(searchParams.get("budget") || "todos");
  }, [searchParams]);

  const handleFilterChange = (theme: string, budget: string) => {
    const params = new URLSearchParams();
    if (theme !== "todos") params.set("recipient", theme);
    if (budget !== "todos") params.set("budget", budget);
    router.push(`/regalos?${params.toString()}`);
  };

  // Filter items locally for instantaneous response
  const filteredProducts = products.filter((product) => {
    // 1. Recipient Filter
    if (activeTheme === "enamorados") {
      // Show products from category "Parejas" or whose ID/description suggests romantic couple themes
      const isCoupleItem = 
        product.category === "Parejas" || 
        product.id.includes("magic") || 
        product.id.includes("heart") || 
        product.description.toLowerCase().includes("regalo") ||
        product.description.toLowerCase().includes("novia") ||
        product.description.toLowerCase().includes("novio") ||
        product.description.toLowerCase().includes("pareja");
      if (!isCoupleItem) return false;
    } else if (activeTheme === "oficina") {
      const isOfficeItem = 
        product.category === "Oficina" || 
        product.id.includes("mousepad") || 
        product.id.includes("coaster") || 
        product.id.includes("tomatodo");
      if (!isOfficeItem) return false;
    }

    // 2. Budget Filter
    const price = product.basePrice;
    if (activeBudget === "under20") {
      if (price >= 20) return false;
    } else if (activeBudget === "20to30") {
      if (price < 20 || price > 30) return false;
    } else if (activeBudget === "over30") {
      if (price <= 30) return false;
    }

    return true;
  });

  const isRomantic = activeTheme === "enamorados";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* Visual Header Cues (adapt border glow if romantic) */}
      <div style={{
        background: isRomantic ? 'rgba(244, 63, 94, 0.03)' : 'var(--bg-card)',
        border: isRomantic ? '1px solid rgba(244, 63, 94, 0.15)' : '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '30px',
        boxShadow: isRomantic ? '0 0 40px rgba(244, 63, 94, 0.08)' : 'var(--shadow-card)',
        transition: 'all 0.5s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Step 1: Destination Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 700 }}>
            🎁 ¿Para quién es el regalo?
          </span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* All Recipients */}
            <button
              onClick={() => handleFilterChange("todos", activeBudget)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeTheme === "todos" ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: activeTheme === "todos" ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' : 'var(--bg-dark-3)',
                color: activeTheme === "todos" ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.3s ease'
              }}
            >
              <Gift size={16} />
              Cualquier Persona
            </button>

            {/* Couples / Enamorados */}
            <button
              onClick={() => handleFilterChange("enamorados", activeBudget)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeTheme === "enamorados" ? '1px solid var(--accent-rose)' : '1px solid var(--border)',
                background: activeTheme === "enamorados" ? 'var(--gradient-rose)' : 'var(--bg-dark-3)',
                color: activeTheme === "enamorados" ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.3s ease',
                boxShadow: activeTheme === "enamorados" ? '0 4px 14px rgba(244, 63, 94, 0.3)' : 'none'
              }}
            >
              <Heart size={16} />
              Mi Pareja / Enamorados
            </button>

            {/* Office / Tech */}
            <button
              onClick={() => handleFilterChange("oficina", activeBudget)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeTheme === "oficina" ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: activeTheme === "oficina" ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' : 'var(--bg-dark-3)',
                color: activeTheme === "oficina" ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.3s ease'
              }}
            >
              <Briefcase size={16} />
              Oficina / Trabajo
            </button>
          </div>
        </div>

        {/* Step 2: Budget Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 700 }}>
            💰 Presupuesto de Regalo
          </span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleFilterChange(activeTheme, "todos")}
              style={{
                padding: '8px 16px',
                borderRadius: '99px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: activeBudget === "todos" ? `1px solid ${isRomantic ? 'var(--accent-rose)' : 'var(--primary)'}` : '1px solid var(--border)',
                background: activeBudget === "todos" ? (isRomantic ? 'var(--gradient-rose)' : 'var(--primary)') : 'transparent',
                color: activeBudget === "todos" ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              Todos los precios
            </button>
            <button
              onClick={() => handleFilterChange(activeTheme, "under20")}
              style={{
                padding: '8px 16px',
                borderRadius: '99px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: activeBudget === "under20" ? `1px solid ${isRomantic ? 'var(--accent-rose)' : 'var(--primary)'}` : '1px solid var(--border)',
                background: activeBudget === "under20" ? (isRomantic ? 'var(--gradient-rose)' : 'var(--primary)') : 'transparent',
                color: activeBudget === "under20" ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              Menos de S/. 20
            </button>
            <button
              onClick={() => handleFilterChange(activeTheme, "20to30")}
              style={{
                padding: '8px 16px',
                borderRadius: '99px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: activeBudget === "20to30" ? `1px solid ${isRomantic ? 'var(--accent-rose)' : 'var(--primary)'}` : '1px solid var(--border)',
                background: activeBudget === "20to30" ? (isRomantic ? 'var(--gradient-rose)' : 'var(--primary)') : 'transparent',
                color: activeBudget === "20to30" ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              S/. 20 - S/. 30
            </button>
            <button
              onClick={() => handleFilterChange(activeTheme, "over30")}
              style={{
                padding: '8px 16px',
                borderRadius: '99px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: activeBudget === "over30" ? `1px solid ${isRomantic ? 'var(--accent-rose)' : 'var(--primary)'}` : '1px solid var(--border)',
                background: activeBudget === "over30" ? (isRomantic ? 'var(--gradient-rose)' : 'var(--primary)') : 'transparent',
                color: activeBudget === "over30" ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              S/. 30+
            </button>
          </div>
        </div>

      </div>

      {/* Gift Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)', color: 'white' }}>
          Ideas recomendadas ({filteredProducts.length})
        </h3>
        {isRomantic && (
          <span style={{ fontSize: '13px', color: 'var(--accent-rose)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            💖 Pack Especial para Enamorados Activo
          </span>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product, idx) => (
            <Link 
              key={product.id} 
              href={`/productos/${product.id}`}
              className={`product-card reveal reveal-delay-${(idx % 4) + 1} visible`}
              style={{
                borderColor: isRomantic ? 'rgba(244, 63, 94, 0.25)' : undefined,
                boxShadow: isRomantic ? '0 8px 32px rgba(244, 63, 94, 0.06)' : undefined,
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Product Image */}
              <div className="product-image">
                <img 
                  src={product.imageUrl || "/img/placeholder.png"} 
                  alt={product.name} 
                />
                <span className={`product-badge ${isRomantic ? 'customizable' : 'popular'}`} style={isRomantic ? { background: 'var(--gradient-rose)', color: 'white' } : undefined}>
                  {isRomantic ? <>💝 <span className="hidden sm:inline">Para Parejas</span></> : <>🎁 <span className="hidden sm:inline">Ideal Regalo</span></>}
                </span>
                
                <span 
                  className={`product-wishlist ${isFav(product.id) ? "active" : ""}`} 
                  aria-label="Favorito" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    toggleFavorite(product.id); 
                  }}
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    fill={isFav(product.id) ? "currentColor" : "none"} 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    style={{ color: isFav(product.id) ? "var(--accent-rose)" : "inherit" }}
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </span>

                <div className="product-overlay">
                  <div className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '13px', background: isRomantic ? 'var(--gradient-rose)' : undefined, border: 'none' }}>
                    {product.isCustomizable ? (isRomantic ? "Diseñar Regalo" : "Personalizar Ahora") : "Ver Detalles"}
                  </div>
                </div>
              </div>
              
              {/* Product Info */}
              <div className="product-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div className="product-header-row">
                  <span className="product-category" style={isRomantic ? { color: 'var(--accent-rose)', marginBottom: 0 } : { marginBottom: 0 }}>
                    {product.category}
                  </span>
                  <div className="product-rating">★★★★★ <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>4.9</span></div>
                </div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                
                <div style={{ flexGrow: 1 }} />
                
                <div className="product-footer" style={{ width: '100%' }}>
                  <span className="product-price">
                    <span className="currency">S/.</span> {product.basePrice.toFixed(2)}
                  </span>
                  <div className={`product-action-link ${isRomantic ? 'rose-theme' : ''}`} style={{ marginTop: 0 }}>
                    <span>{product.isCustomizable ? (isRomantic ? "Diseñar regalo" : "Personalizar ahora") : "Ver detalles"}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
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
          <span style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</span>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>No encontramos coincidencias</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, maxWidth: '400px' }}>
            Prueba ajustando el presupuesto o seleccionando otra categoría en la parte superior.
          </p>
        </div>
      )}

    </div>
  );
}
