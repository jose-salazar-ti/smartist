"use client";

import React from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";

interface AddToCartBarProps {
  variant: "mobile" | "desktop";
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>> | ((q: number | ((prev: number) => number)) => void);
  totalPrice: number;
  handleAddToCart: () => void;
}

export default function AddToCartBar({
  variant,
  quantity,
  setQuantity,
  totalPrice,
  handleAddToCart,
}: AddToCartBarProps) {
  const isMobile = variant === "mobile";
  
  return (
    <div className={isMobile ? "customizer-footer lg:hidden" : "customizer-footer-desktop hidden lg:flex lg:order-7"}>
      {/* Highlight line on top - fading out at edges to respect border-radius */}
      <div style={{ position: 'absolute', top: 0, left: '32px', right: '32px', height: '2px', background: 'linear-gradient(90deg, transparent 0%, var(--primary-light) 50%, transparent 100%)', opacity: 0.85 }}></div>
      
      {/* Quantity Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="hidden sm:inline" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cantidad</span>
        <div className="customizer-quantity">
          <button 
            type="button"
            onClick={() => setQuantity((q: number) => Math.max(1, q - 1))}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Minus size={12} />
          </button>
          <span className="customizer-quantity-val">{quantity}</span>
          <button 
            type="button"
            onClick={() => setQuantity((q: number) => q + 1)}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Total Price & Button */}
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="customizer-price-block">
          <span className="hidden sm:inline" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>Total Estimado</span>
          <span className="customizer-price-val">
            S/.{totalPrice.toFixed(2)}
          </span>
        </div>
        
        {/* Botón Premium Agregar al Carrito */}
        <button 
          onClick={handleAddToCart}
          className="customizer-btn-add"
        >
          <ShoppingCart size={16} />
          <span>Agregar<span className="hidden sm:inline"> al Carrito</span></span>
        </button>
      </div>
    </div>
  );
}
