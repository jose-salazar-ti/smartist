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

interface ProductsListProps {
  products: Product[];
}

export default function ProductsList({ products }: ProductsListProps) {
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const favorites = useFavoritesStore((state) => state.favorites);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isFav = (id: string) => mounted && favorites.includes(id);

  return (
    <div className="products-grid">
      {products.map((product, idx) => (
        <Link 
          key={product.id} 
          href={`/productos/${product.id}`}
          className={`product-card reveal reveal-delay-${(idx % 4) + 1} visible`} 
          data-category={product.category.toLowerCase()}
          style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
        >
          <div className="product-image">
            <img 
              src={product.imageUrl || "/img/placeholder.png"} 
              alt={product.name} 
            />
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
              <div className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '13px' }}>
                {product.isCustomizable ? "Personalizar Ahora" : "Ver Detalles"}
              </div>
            </div>
          </div>
          
          <div className="product-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <div className="product-header-row">
              <span className="product-category" style={{ marginBottom: 0 }}>{product.category}</span>
              <div className="product-rating">★★★★★ <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>4.9</span></div>
            </div>
            <h3 className="product-name">{product.name}</h3>
            <p className="product-desc">{product.description}</p>
            
            <div style={{ flexGrow: 1 }} />
            
            <div className="product-footer" style={{ width: '100%' }}>
              <span className="product-price">
                <span className="currency">S/.</span> {product.basePrice.toFixed(2)}
              </span>
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
  );
}
