"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useFavoritesStore } from "@/store/favoritesStore";

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  category: string;
  isCustomizable: boolean;
}

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const favorites = useFavoritesStore((state) => state.favorites);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isFav = (id: string) => mounted && favorites.includes(id);

  return (
    <section className="products" id="catalogo">
      <div className="container">
        <div className="products-header reveal" style={{ justifyContent: 'center', textAlign: 'center', marginBottom: '32px' }}>
          <div>
            <div className="section-label" style={{ justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
              Catálogo
            </div>
            <h2 className="section-title">
              Productos <span className="gradient-text">destacados</span>
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Nuestros más vendidos y favoritos de los clientes.
            </p>
          </div>
        </div>

        <div className="products-grid">
          {products.map((product, idx) => (
            <Link 
              key={product.id} 
              href={`/productos/${product.id}`}
              className={`product-card reveal reveal-delay-${(idx % 4) + 1}`} 
              data-category={product.category.toLowerCase()}
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
            >
              <div className="product-image">
                <img src={product.imageUrl || "/img/placeholder.png"} alt={product.name} />
                {product.isCustomizable ? (
                  <span className="product-badge customizable">🎨 <span className="hidden sm:inline">Personalizable</span></span>
                ) : (
                  <span className="product-badge popular">🔥 <span className="hidden sm:inline">Más Vendido</span></span>
                )}
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
                  <div className="btn btn-primary" style={{width: "100%", padding: "10px", fontSize: "13px"}}>
                    {product.isCustomizable ? "Personalizar Ahora" : "Ver Detalles"}
                  </div>
                </div>
              </div>
              <div className="product-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div className="product-header-row">
                  <span className="product-category" style={{ marginBottom: 0 }}>{product.category}</span>
                  <div className="product-rating">★★★★★ <span style={{color: "var(--text-muted)", marginLeft: '4px'}}>4.9</span></div>
                </div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                
                <div style={{ flexGrow: 1 }} />
                
                <div className="product-footer" style={{ width: '100%' }}>
                  <span className="product-price"><span className="currency">S/.</span> {product.basePrice.toFixed(2)}</span>
                  <div className="product-action-link" style={{ marginTop: 0 }}>
                    <span>{product.isCustomizable ? "Personalizar ahora" : "Ver detalles"}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="reveal" style={{ display: 'flex', justifyContent: 'center', marginTop: '48px' }}>
          <Link href="/productos" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Ver todos los productos
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
