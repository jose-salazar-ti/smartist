"use client";

import React from "react";
import { Product } from "@/services/product-types";

interface ProductInfoProps {
  product: Product;
  selectedVariant: {
    id: string;
    title: string;
    price: number;
    options: { [key: string]: string };
  };
  viewMode: "catalog" | "customize";
  productSpecs: {
    features: { label: string; value: string }[];
    benefits: string[];
  };
}

export default function ProductInfo({
  product,
  selectedVariant,
  viewMode,
  productSpecs,
}: ProductInfoProps) {
  return (
    <>
      <div className="order-3 lg:order-1 flex flex-col gap-2">
        <div>
          <span className="section-label" style={{ marginBottom: '12px' }}>
            {product.category}
          </span>
          <h1 className="section-title" style={{ fontSize: '38px', marginBottom: '12px' }}>
            {product.name}
          </h1>
          {viewMode === "catalog" && (
            <p className="section-subtitle" style={{ marginBottom: '16px' }}>
              {product.description}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
              S/. {selectedVariant.price.toFixed(2)}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Precio Base por Unidad</span>
          </div>

          {product.isCustomizable && viewMode === "catalog" && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px dashed rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12.5px',
              color: 'var(--text-primary)',
              lineHeight: '1.4'
            }}>
              <span style={{ fontSize: '16px' }}>✨</span>
              <div>
                <strong>¡Producto Personalizable!</strong> Puedes agregar tus propias fotos y textos gratis haciendo clic en <strong>"Personalizar Diseño"</strong> (en la pestaña de la izquierda).
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="order-4 lg:order-2" style={{ border: 'none', borderTop: '1px solid var(--border-hover)' }} />

      {viewMode === "catalog" && (
        <>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-hover)' }} />
          
          {/* Ficha Técnica: Características y Beneficios */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Especificaciones Técnicas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {productSpecs.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', padding: '10px 14px', background: 'var(--bg-dark-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{feat.label}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700, marginTop: '2px' }}>{feat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-hover)', paddingTop: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Beneficios Clave
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '20px', listStyleType: 'disc', color: 'var(--text-secondary)', fontSize: '13px' }}>
                {productSpecs.benefits.map((benefit, idx) => (
                  <li key={idx} style={{ lineHeight: '1.4' }}>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
}
