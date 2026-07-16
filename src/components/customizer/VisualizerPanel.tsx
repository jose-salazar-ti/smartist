"use client";

import React from "react";
import dynamic from 'next/dynamic';
import Image from "next/image";
import { Product } from "@/services/product-types";

const MugViewer3D = dynamic(() => import('@/components/3d/MugViewer3D'), { 
  ssr: false,
  loading: () => <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5'}}>Cargando Motor 3D...</div>
});

interface VisualizerPanelProps {
  product: Product;
  viewMode: "catalog" | "customize";
  setViewMode: (mode: "catalog" | "customize") => void;
  selectedCatalogImage: string;
  setSelectedCatalogImage: (img: string) => void;
  currentGlbModelUrl?: string | null;
  warpedPreview: string | null;
  currentBlankMockupUrl?: string | null;
  getPrintAreaStyle: () => React.CSSProperties;
  currentMockupConfig?: any;
  currentPrintDimensions?: any;
  isMug: boolean;
  imageSrc: string | null;
  imageSrcRight: string | null;
  customText: string;
  customTextRight: string;
}

export default function VisualizerPanel({
  product,
  viewMode,
  setViewMode,
  selectedCatalogImage,
  setSelectedCatalogImage,
  currentGlbModelUrl,
  warpedPreview,
  currentBlankMockupUrl,
  getPrintAreaStyle,
  currentMockupConfig,
  currentPrintDimensions,
  isMug,
  imageSrc,
  imageSrcRight,
  customText,
  customTextRight,
}: VisualizerPanelProps) {
  return (
    <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-[90px] lg:self-start">
      
      {/* View Mode Toggle */}
      {product.isCustomizable && (
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-dark-3)', padding: '6px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <button 
            type="button"
            onClick={() => setViewMode("catalog")}
            style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, transition: 'all 0.3s', background: viewMode === "catalog" ? 'var(--primary)' : 'transparent', color: viewMode === "catalog" ? 'white' : 'var(--text-secondary)' }}
          >
            Galería de Catálogo
          </button>
          <button 
            type="button"
            onClick={() => setViewMode("customize")}
            style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, transition: 'all 0.3s', background: viewMode === "customize" ? 'var(--primary)' : 'transparent', color: viewMode === "customize" ? 'white' : 'var(--text-secondary)' }}
          >
            Personalizar Diseño
          </button>
        </div>
      )}

      {/* Visualizer Card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ position: 'relative', aspectRatio: '1/1', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark-2)' }}>
          
          {/* 3D WEBGL VIEWER (SOLO PARA PRODUCTOS CON ARCHIVO GLB) */}
          {viewMode === "customize" && (currentGlbModelUrl || product.id.includes("taza")) ? (
            <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
              <MugViewer3D 
                textureUrl={warpedPreview} 
                baseColor="#ffffff" 
                modelUrl={currentGlbModelUrl || "/models/mug.glb"} 
              />
            </div>
          ) : (
            <>
              {/* Product Base Image (2D) */}
              <div style={{ position: 'absolute', inset: 0, userSelect: 'none', pointerEvents: 'none' }}>
                <Image
                  src={viewMode === "customize" ? (currentBlankMockupUrl || product.imageUrl) : selectedCatalogImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover', objectPosition: 'center', pointerEvents: 'none', userSelect: 'none' }}
                  priority
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>

              {/* PRINT AREA OVERLAY - ONLY SHOW IN CUSTOMIZE MODE */}
              {viewMode === "customize" && (
                <div 
                  style={{ 
                    position: 'absolute', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    pointerEvents: 'none', background: 'rgba(0,0,0,0.2)', ...getPrintAreaStyle() 
                  }}
                >
                  {/* 2D PREVIEW */}
                  {warpedPreview ? (
                    <div style={{ 
                      position: 'relative', 
                      width: '100%', 
                      height: '100%',
                      // Perspectiva 3D calibrada para Fotoroca
                      transform: (product.id === 'photo-slate' || product.name.toLowerCase().includes('fotoroca')) 
                                   ? 'perspective(800px) rotateX(-4deg) rotateY(7deg) rotateZ(-1deg) scale(1.02)' 
                                   : (currentMockupConfig?.transform || 'none'),
                      transformOrigin: currentMockupConfig?.transformOrigin || 'center center'
                    }}>
                      <Image
                        src={warpedPreview}
                        alt="Customization preview"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover', pointerEvents: 'none', userSelect: 'none' }} 
                        unoptimized
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '9px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', animation: 'pulse 2s infinite' }}>
                      Cargando Preview...
                    </div>
                  )}

                  {/* Print area indicator border label */}
                  <div style={{ position: 'absolute', bottom: '8px', left: '0', width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '9px', fontWeight: 600, letterSpacing: '1px' }}>
                    ZONA DE IMPRESIÓN
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Thumbnails Gallery */}
      {viewMode === "catalog" && product.galleryImages && product.galleryImages.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px 0' }}>
          {product.galleryImages.map((img, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedCatalogImage(img)}
              style={{ 
                position: 'relative', width: '80px', height: '80px', flexShrink: 0, cursor: 'pointer',
                borderRadius: 'var(--radius-md)', overflow: 'hidden', border: selectedCatalogImage === img ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'border-color 0.3s', background: 'var(--bg-dark-3)'
              }}
            >
              <Image src={img} alt={`Gallery ${idx}`} fill sizes="80px" style={{ objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}

      {/* Plantilla Plana del Diseño - Visible en desktop */}
      {viewMode === "customize" && (
        <div className="hidden lg:flex flex-col gap-2 mt-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Plantilla Plana del Diseño {currentPrintDimensions?.width && currentPrintDimensions?.height ? `(${currentPrintDimensions.width}cm x ${currentPrintDimensions.height}cm)` : ((product.category.toLowerCase() === "tazas" || product.id.includes("taza")) ? "(20cm x 9.5cm)" : "(Área Imprimible)")}
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Proporción exacta de la hoja</span>
          </div>
          <div style={{ 
            width: '100%', 
            aspectRatio: (currentPrintDimensions?.width && currentPrintDimensions?.height) ? `${currentPrintDimensions.width}/${currentPrintDimensions.height}` : ((product.category.toLowerCase() === "tazas" || product.id.includes("taza")) ? '20/9.5' : '816/344'), 
            background: 'repeating-conic-gradient(#f8f9fa 0% 25%, #ffffff 0% 50%) 50% / 16px 16px', 
            border: '1px solid var(--border)',
            outline: '1px dashed rgba(99, 102, 241, 0.5)',
            outlineOffset: '-1px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            borderRadius: '2px', 
            overflow: 'hidden',
            position: 'relative'
          }}>
            {warpedPreview ? (
              <div style={{ 
                position: 'absolute', 
                width: '125.49%', 
                height: '100%', 
                left: '-12.75%', 
                top: 0 
              }}>
                <Image 
                  src={warpedPreview} 
                  alt="Flat print template preview" 
                  fill 
                  style={{ objectFit: 'cover', pointerEvents: 'none', userSelect: 'none' }} 
                  unoptimized 
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#4b5563', fontSize: '12px' }}>
                Esperando personalización...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simulación CMYK Badge - Desktop Only */}
      {viewMode === "customize" && (
        <div 
          className="hidden lg:flex"
          style={{ 
            background: 'rgba(99, 102, 241, 0.05)', 
            border: '1px solid rgba(99, 102, 241, 0.15)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '12px 16px', 
            alignItems: 'center', 
            gap: '12px',
            marginTop: '4px'
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px #6366f1', flexShrink: 0 }}></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Simulación CMYK Activa</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Los colores simulan la impresión real por sublimación.</span>
          </div>
        </div>
      )}

    </div>
  );
}
