"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RotateCcw } from "lucide-react";
import { Product } from "@/services/product-types";
import { useProductCustomizer } from "@/hooks/useProductCustomizer";
import VisualizerPanel from "@/components/customizer/VisualizerPanel";
import ProductInfo from "@/components/customizer/ProductInfo";
import ProductOptions from "@/components/customizer/ProductOptions";
import DesignEditor from "@/components/customizer/DesignEditor";
import AddToCartBar from "@/components/customizer/AddToCartBar";

interface ProductCustomizerProps {
  product: Product;
  relatedProducts?: Product[];
}

export default function ProductCustomizer({ product, relatedProducts = [] }: ProductCustomizerProps) {
  const router = useRouter();
  const customizer = useProductCustomizer(product);

  return (
    <section className="pb-[140px] lg:pb-20" style={{ paddingTop: '120px', minHeight: '100vh' }}>
      <div className="container">
        
        {/* Breadcrumb */}
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '30px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="hover:text-white cursor-pointer transition-colors" onClick={() => router.push("/")}>Catálogo</span>
          <span>/</span>
          <span className="hover:text-white cursor-pointer transition-colors" onClick={() => router.push(`/?category=${product.category}`)}>{product.category}</span>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Left Side: Mockup Visualizer */}
          <VisualizerPanel
            product={product}
            viewMode={customizer.viewMode}
            setViewMode={customizer.setViewMode}
            selectedCatalogImage={customizer.selectedCatalogImage}
            setSelectedCatalogImage={customizer.setSelectedCatalogImage}
            currentGlbModelUrl={customizer.currentGlbModelUrl}
            warpedPreview={customizer.warpedPreview}
            currentBlankMockupUrl={customizer.currentBlankMockupUrl}
            getPrintAreaStyle={customizer.getPrintAreaStyle}
            currentMockupConfig={customizer.currentMockupConfig}
            currentPrintDimensions={customizer.currentPrintDimensions}
            isMug={customizer.isMug}
            imageSrc={customizer.imageSrc}
            imageSrcRight={customizer.imageSrcRight}
            customText={customizer.customText}
            customTextRight={customizer.customTextRight}
          />

          {/* Right Side: Options & Customizer form */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
            
            <ProductInfo
              product={product}
              selectedVariant={customizer.selectedVariant}
              viewMode={customizer.viewMode}
              productSpecs={customizer.productSpecs}
            />

            <ProductOptions
              optionKeys={customizer.optionKeys}
              selectedOptions={customizer.selectedOptions}
              getOptionValues={customizer.getOptionValues}
              handleOptionChange={customizer.handleOptionChange}
            />

            {customizer.viewMode === "customize" && (
              <div className="order-6 lg:order-4 flex flex-col gap-6 relative">
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-hover)' }} />
                
                {/* Vista Previa Móvil: Plantilla Plana Flotante / Sticky */}
                <div 
                  className={`flex lg:hidden flex-col gap-2 mb-2 ${
                    (customizer.imageSrc || customizer.imageSrcRight || customizer.customText.trim() !== "" || customizer.customTextRight.trim() !== "") 
                      ? "sticky top-[75px] z-30 bg-white/95 dark:bg-[#0a0815]/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-lg dark:shadow-2xl" 
                      : "relative bg-slate-100/40 dark:bg-[#0a0815]/40 p-3 rounded-xl border border-slate-200 dark:border-white/[0.04]"
                  }`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Plantilla Plana del Diseño {customizer.currentPrintDimensions?.width && customizer.currentPrintDimensions?.height ? `(${customizer.currentPrintDimensions.width}cm x ${customizer.currentPrintDimensions.height}cm)` : "(Área Imprimible)"}
                    </h3>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Proporción de la hoja</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    aspectRatio: (customizer.currentPrintDimensions?.width && customizer.currentPrintDimensions?.height) ? `${customizer.currentPrintDimensions.width}/${customizer.currentPrintDimensions.height}` : ((product.category.toLowerCase() === "tazas" || product.id.includes("taza")) ? '20/9.5' : '816/344'), 
                    background: 'repeating-conic-gradient(#f8f9fa 0% 25%, #ffffff 0% 50%) 50% / 16px 16px', 
                    border: '1px solid var(--border)',
                    outline: '1px dashed rgba(99, 102, 241, 0.5)',
                    outlineOffset: '-1px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    borderRadius: '2px', 
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {customizer.warpedPreview ? (
                      <div style={{ 
                        position: 'absolute', 
                        width: '125.49%', 
                        height: '100%', 
                        left: '-12.75%', 
                        top: 0 
                      }}>
                        <Image 
                          src={customizer.warpedPreview} 
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#4b5563', fontSize: '11px' }}>
                        Esperando personalización...
                      </div>
                    )}
                  </div>
                </div>

                <DesignEditor
                  product={product}
                  isMug={customizer.isMug}
                  isIndependentMug={customizer.isIndependentMug}
                  mugDesignMode={customizer.mugDesignMode}
                  setMugDesignMode={customizer.setMugDesignMode}
                  activeSide={customizer.activeSide}
                  setActiveSide={customizer.setActiveSide}
                  fileInputRef={customizer.fileInputRef}
                  handleImageUpload={customizer.handleImageUpload}
                  triggerFileUpload={customizer.triggerFileUpload}
                  currentImageName={customizer.currentImageName}
                  currentHasImage={customizer.currentHasImage}
                  currentImageWidth={customizer.currentImageWidth}
                  currentImageHeight={customizer.currentImageHeight}
                  currentDpiStatus={customizer.currentDpiStatus}
                  currentImageScale={customizer.currentImageScale}
                  setImageScaleRight={customizer.setImageScaleRight}
                  setImageScale={customizer.setImageScale}
                  currentImageX={customizer.currentImageX}
                  setImageXRight={customizer.setImageXRight}
                  setImageX={customizer.setImageX}
                  currentImageY={customizer.currentImageY}
                  setImageYRight={customizer.setImageYRight}
                  setImageY={customizer.setImageY}
                  currentImageRotation={customizer.currentImageRotation}
                  setImageRotationRight={customizer.setImageRotationRight}
                  setImageRotation={customizer.setImageRotation}
                  currentCustomText={customizer.currentCustomText}
                  setCustomTextRight={customizer.setCustomTextRight}
                  setCustomText={customizer.setCustomText}
                  textAlign={customizer.textAlign}
                  setTextAlign={customizer.setTextAlign}
                  textBold={customizer.textBold}
                  setTextBold={customizer.setTextBold}
                  textItalic={customizer.textItalic}
                  setTextItalic={customizer.setTextItalic}
                  textFont={customizer.textFont}
                  setFontFamily={customizer.setFontFamily}
                  textColor={customizer.textColor}
                  setTextColor={customizer.setTextColor}
                  textSize={customizer.textSize}
                  setTextSize={customizer.setTextSize}
                  currentTextYOffset={customizer.currentTextYOffset}
                  setTextYOffsetRight={customizer.setTextYOffsetRight}
                  setTextYOffset={customizer.setTextYOffset}
                  currentTextCurve={customizer.currentTextCurve}
                  setTextCurveRight={customizer.setTextCurveRight}
                  setTextCurve={customizer.setTextCurve}
                  textShadowEnabled={customizer.textShadowEnabled}
                  setTextShadowEnabled={customizer.setTextShadowEnabled}
                  textShadowColor={customizer.textShadowColor}
                  setTextShadowColor={customizer.setTextShadowColor}
                  textShadowBlur={customizer.textShadowBlur}
                  setTextShadowBlur={customizer.setTextShadowBlur}
                  textShadowOffset={customizer.textShadowOffset}
                  setTextShadowOffset={customizer.setTextShadowOffset}
                />

                {/* Botón para restablecer estilo o personalización */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-10px', marginBottom: '10px' }}>
                  <button
                    type="button"
                    onClick={customizer.resetCustomization}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 'var(--radius-xl)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    <RotateCcw style={{ width: '15px', height: '15px', color: '#ef4444' }} />
                    <span>Restablecer Personalización</span>
                  </button>
                </div>
              </div>
            )}

            <hr className="order-6 lg:order-6" style={{ border: 'none', borderTop: '1px solid var(--border-hover)' }} />

            {/* Add to Cart Footer section (Desktop variant) */}
            <AddToCartBar
              variant="desktop"
              quantity={customizer.quantity}
              setQuantity={customizer.setQuantity}
              totalPrice={customizer.totalPrice}
              handleAddToCart={customizer.handleAddToCart}
            />
          </div>
        </div>

        {/* Productos Relacionados */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div style={{ marginTop: '80px', paddingTop: '60px', borderTop: '1px solid var(--border-hover)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '40px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--primary)', textTransform: 'uppercase' }}>
                Te podría interesar
              </span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 0 }}>
                Productos <span className="gradient-text">Similares</span>
              </h2>
            </div>

            <div className="products-grid">
              {relatedProducts.map((related) => (
                <a 
                  key={related.id} 
                  href={`/productos/${related.id}`}
                  className="product-card visible" 
                  style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
                >
                  <div className="product-image">
                    <img 
                      src={related.imageUrl || "/img/placeholder.png"} 
                      alt={related.name} 
                    />
                    {related.isCustomizable ? (
                      <span className="product-badge customizable">🎨 <span className="hidden sm:inline">Personalizable</span></span>
                    ) : (
                      <span className="product-badge popular">🔥 <span className="hidden sm:inline">Más Vendido</span></span>
                    )}
                  </div>
                  
                  <div className="product-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div className="product-header-row">
                      <span className="product-category" style={{ marginBottom: 0 }}>{related.category}</span>
                      <div className="product-rating">★★★★★ <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>4.9</span></div>
                    </div>
                    <h3 className="product-name">{related.name}</h3>
                    <p className="product-desc">{related.description}</p>
                    
                    <div style={{ flexGrow: 1 }} />
                    
                    <div className="product-footer" style={{ width: '100%' }}>
                      <span className="product-price">
                        <span className="currency">S/.</span> {related.basePrice.toFixed(2)}
                      </span>
                      <div className="product-action-link" style={{ marginTop: 0 }}>
                        <span>Personalizar ahora</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Add to Cart Footer section (Mobile variant) */}
      <AddToCartBar
        variant="mobile"
        quantity={customizer.quantity}
        setQuantity={customizer.setQuantity}
        totalPrice={customizer.totalPrice}
        handleAddToCart={customizer.handleAddToCart}
      />
    </section>
  );
}
