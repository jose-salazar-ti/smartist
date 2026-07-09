"use client";

import React from "react";
import { 
  Palette, Upload, Check, AlertTriangle, RotateCw, Maximize2,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic
} from "lucide-react";
import { Product } from "@/services/product-types";

interface DesignEditorProps {
  product: Product;
  isMug: boolean;
  isIndependentMug: boolean;
  mugDesignMode: "centered" | "duplicated" | "independent";
  setMugDesignMode: (mode: "centered" | "duplicated" | "independent") => void;
  activeSide: "left" | "right";
  setActiveSide: (side: "left" | "right") => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  triggerFileUpload: () => void;
  currentImageName: string;
  currentHasImage: boolean;
  currentImageWidth: number;
  currentImageHeight: number;
  currentDpiStatus: "idle" | "low" | "high";
  currentImageScale: number;
  setImageScaleRight: (val: number) => void;
  setImageScale: (val: number) => void;
  currentImageX: number;
  setImageXRight: (val: number) => void;
  setImageX: (val: number) => void;
  currentImageY: number;
  setImageYRight: (val: number) => void;
  setImageY: (val: number) => void;
  currentImageRotation: number;
  setImageRotationRight: (val: number) => void;
  setImageRotation: (val: number) => void;
  currentCustomText: string;
  setCustomTextRight: (val: string) => void;
  setCustomText: (val: string) => void;
  textAlign: "left" | "center" | "right";
  setTextAlign: (val: "left" | "center" | "right") => void;
  textBold: boolean;
  setTextBold: React.Dispatch<React.SetStateAction<boolean>> | ((val: boolean | ((prev: boolean) => boolean)) => void) | any;
  textItalic: boolean;
  setTextItalic: React.Dispatch<React.SetStateAction<boolean>> | ((val: boolean | ((prev: boolean) => boolean)) => void) | any;
  textFont: string;
  setFontFamily: (val: string) => void;
  textColor: string;
  setTextColor: (val: string) => void;
  textSize: number;
  setTextSize: (val: number) => void;
  currentTextYOffset: number;
  setTextYOffsetRight: (val: number) => void;
  setTextYOffset: (val: number) => void;
  currentTextCurve: number;
  setTextCurveRight: (val: number) => void;
  setTextCurve: (val: number) => void;
  textShadowEnabled: boolean;
  setTextShadowEnabled: (val: boolean) => void;
  textShadowColor: string;
  setTextShadowColor: (val: string) => void;
  textShadowBlur: number;
  setTextShadowBlur: (val: number) => void;
  textShadowOffset: number;
  setTextShadowOffset: (val: number) => void;
}

export default function DesignEditor({
  product,
  isMug,
  isIndependentMug,
  mugDesignMode,
  setMugDesignMode,
  activeSide,
  setActiveSide,
  fileInputRef,
  handleImageUpload,
  triggerFileUpload,
  currentImageName,
  currentHasImage,
  currentImageWidth,
  currentImageHeight,
  currentDpiStatus,
  currentImageScale,
  setImageScaleRight,
  setImageScale,
  currentImageX,
  setImageXRight,
  setImageX,
  currentImageY,
  setImageYRight,
  setImageY,
  currentImageRotation,
  setImageRotationRight,
  setImageRotation,
  currentCustomText,
  setCustomTextRight,
  setCustomText,
  textAlign,
  setTextAlign,
  textBold,
  setTextBold,
  textItalic,
  setTextItalic,
  textFont,
  setFontFamily,
  textColor,
  setTextColor,
  textSize,
  setTextSize,
  currentTextYOffset,
  setTextYOffsetRight,
  setTextYOffset,
  currentTextCurve,
  setTextCurveRight,
  setTextCurve,
  textShadowEnabled,
  setTextShadowEnabled,
  textShadowColor,
  setTextShadowColor,
  textShadowBlur,
  setTextShadowBlur,
  textShadowOffset,
  setTextShadowOffset,
}: DesignEditorProps) {
  const handleControlInteraction = (e: React.PointerEvent<HTMLDivElement>) => {
    if (typeof document === "undefined") return;
    const target = e.target as HTMLElement;
    const isTextInput = target.tagName.toLowerCase() === "textarea" || 
                        (target.tagName.toLowerCase() === "input" && target.getAttribute("type") === "text");
    
    if (isTextInput) {
      return;
    }
    
    const active = document.activeElement;
    if (active instanceof HTMLElement && (active.tagName.toLowerCase() === "textarea" || active.tagName.toLowerCase() === "input")) {
      active.blur();
    }
  };

  return (
    <div className="order-1 lg:order-5" onPointerDown={handleControlInteraction} style={{ 
      background: 'var(--bg-card)', 
      padding: '24px', 
      borderRadius: 'var(--radius-xl)', 
      border: '1px solid rgba(99, 102, 241, 0.15)', 
      position: 'relative'
    }}>
      {/* Glowing vertical accent line */}
      <div style={{ 
        position: 'absolute', 
        left: 0, 
        top: '24px', 
        bottom: '24px', 
        width: '3px', 
        background: 'linear-gradient(to bottom, transparent, var(--primary-light), var(--primary), transparent)', 
        borderRadius: 'var(--radius-full)' 
      }} />
      
      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Palette size={20} color="var(--primary-light)" /> Personaliza tu Arte
      </h3>

      {/* Mug Design Mode Selector */}
      {isMug && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', position: 'relative', zIndex: 10 }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Distribución del Diseño</span>
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-dark-2)', padding: '4px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setMugDesignMode("centered")}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: mugDesignMode === "centered" ? 'var(--primary)' : 'transparent',
                color: mugDesignMode === "centered" ? 'white' : 'var(--text-secondary)'
              }}
            >
              Centrado
            </button>
            <button
              type="button"
              onClick={() => setMugDesignMode("duplicated")}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: mugDesignMode === "duplicated" ? 'var(--primary)' : 'transparent',
                color: mugDesignMode === "duplicated" ? 'white' : 'var(--text-secondary)'
              }}
            >
              Duplicado
            </button>
            <button
              type="button"
              onClick={() => setMugDesignMode("independent")}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: mugDesignMode === "independent" ? 'var(--primary)' : 'transparent',
                color: mugDesignMode === "independent" ? 'white' : 'var(--text-secondary)'
              }}
            >
              Independiente
            </button>
          </div>
        </div>
      )}

      {/* Active Side Tabs (only in independent mode for mugs) */}
      {isIndependentMug && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', padding: '4px', background: 'rgba(99, 102, 241, 0.04)', borderRadius: 'var(--radius-md)', border: '1px dashed rgba(99, 102, 241, 0.2)', position: 'relative', zIndex: 10 }}>
          <button
            type="button"
            onClick={() => setActiveSide("left")}
            style={{
              flex: 1, padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: activeSide === "left" ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeSide === "left" ? 'var(--primary-light)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeSide === "left" ? 'var(--primary-light)' : 'transparent', border: '1px solid var(--text-muted)' }}></span>
            Lado A (Frente)
          </button>
          <button
            type="button"
            onClick={() => setActiveSide("right")}
            style={{
              flex: 1, padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: activeSide === "right" ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeSide === "right" ? 'var(--primary-light)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeSide === "right" ? 'var(--primary-light)' : 'transparent', border: '1px solid var(--text-muted)' }}></span>
            Lado B (Posterior)
          </button>
        </div>
      )}
      
      {/* File Upload Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 10 }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Diseño Impreso (PNG o JPG) {isIndependentMug ? (activeSide === "left" ? "(Lado A)" : "(Lado B)") : ""}</label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/png, image/jpeg, image/webp"
          style={{ display: 'none' }}
        />
        <div 
          onClick={triggerFileUpload}
          style={{ 
            display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px',
            border: '2px dashed var(--border-hover)', borderRadius: 'var(--radius-md)', padding: '12px 16px', 
            cursor: 'pointer', background: 'var(--bg-dark-3)', transition: 'all 0.3s' 
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Upload size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentImageName ? "Cambiar Imagen" : "Subir archivo de impresión"}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
              PNG, JPG, JPEG o WEBP. Máx. 10MB. Se recomienda fondo transparente y 300 DPI.
            </span>
          </div>
        </div>
      </div>

      {/* DPI status and controls inside the design editor container */}
      {currentHasImage && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 10 }}>
          {/* DPI resolution quality badge */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>Resolución del Archivo {isIndependentMug ? (activeSide === "left" ? "(Lado A)" : "(Lado B)") : ""}</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{currentImageName}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '2px' }}>{currentImageWidth} x {currentImageHeight} px</span>
            </div>
            {currentDpiStatus === "high" ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '99px', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', fontSize: '12px', fontWeight: 600, color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Check size={16} /> Óptima Calidad
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '99px', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 12px', fontSize: '12px', fontWeight: 600, color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <AlertTriangle size={16} className="animate-bounce" /> Resolución Baja
              </div>
            )}
          </div>

          {/* Adjust layout sliders */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Maximize2 size={16} color="var(--primary-light)" /> Ajustar Diseño Subido {isIndependentMug ? (activeSide === "left" ? "(Lado A)" : "(Lado B)") : ""}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <span>Tamaño / Escala</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{currentImageScale}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={currentImageScale}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (isIndependentMug && activeSide === "right") setImageScaleRight(val);
                    else setImageScale(val);
                  }}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    <span>Posición Horizontal</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{currentImageX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={currentImageX}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (isIndependentMug && activeSide === "right") setImageXRight(val);
                      else setImageX(val);
                    }}
                    style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    <span>Posición Vertical</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{currentImageY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={currentImageY}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (isIndependentMug && activeSide === "right") setImageYRight(val);
                      else setImageY(val);
                    }}
                    style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><RotateCw size={12} /> Rotación</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{currentImageRotation}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={currentImageRotation}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (isIndependentMug && activeSide === "right") setImageRotationRight(val);
                    else setImageRotation(val);
                  }}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Text Option */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '20px', position: 'relative', zIndex: 10 }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Agregar Texto Impreso {isIndependentMug ? (activeSide === "left" ? "(Lado A)" : "(Lado B)") : ""}</label>
        <textarea
          placeholder="Escribe aquí tu frase o nombre (permite saltos de línea)"
          value={currentCustomText}
          onChange={(e) => {
            const val = e.target.value;
            if (isIndependentMug && activeSide === "right") setCustomTextRight(val);
            else setCustomText(val);
          }}
          rows={3}
          style={{ 
            background: 'var(--bg-dark-3)', border: '1px solid var(--border)', color: 'var(--text-primary)', 
            borderRadius: 'var(--radius-md)', padding: '12px 16px', outline: 'none', width: '100%',
            resize: 'none', fontFamily: 'inherit', fontSize: '14px', lineHeight: '1.5'
          }}
        />
        
        {currentCustomText.trim() !== "" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>
            {/* Alineación y Formatos (Negrita, Cursiva) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              
              {/* Botones de Alineación */}
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-dark-2)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setTextAlign("left")}
                  style={{ 
                    padding: '6px 10px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: textAlign === "left" ? 'var(--primary)' : 'transparent', color: textAlign === "left" ? 'white' : 'var(--text-secondary)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  title="Alinear a la Izquierda"
                >
                  <AlignLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign("center")}
                  style={{ 
                    padding: '6px 10px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: textAlign === "center" ? 'var(--primary)' : 'transparent', color: textAlign === "center" ? 'white' : 'var(--text-secondary)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  title="Centrar Texto"
                >
                  <AlignCenter size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign("right")}
                  style={{ 
                    padding: '6px 10px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: textAlign === "right" ? 'var(--primary)' : 'transparent', color: textAlign === "right" ? 'white' : 'var(--text-secondary)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  title="Alinear a la Derecha"
                >
                  <AlignRight size={16} />
                </button>
              </div>

              {/* Botones de Formato Negrita/Cursiva */}
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-dark-2)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setTextBold((b: boolean) => !b)}
                  style={{ 
                    padding: '6px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: textBold ? 'var(--primary)' : 'transparent', color: textBold ? 'white' : 'var(--text-secondary)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  title="Negrita"
                >
                  <Bold size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setTextItalic((i: boolean) => !i)}
                  style={{ 
                    padding: '6px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: textItalic ? 'var(--primary)' : 'transparent', color: textItalic ? 'white' : 'var(--text-secondary)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  title="Cursiva"
                >
                  <Italic size={16} />
                </button>
              </div>
            </div>

            {/* Tipografía y Color de Letra */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Tipografía</label>
                <select 
                  value={textFont} 
                  onChange={(e) => setFontFamily(e.target.value)}
                  style={{ background: 'var(--bg-dark-3)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="font-sans">Moderna (Sans)</option>
                  <option value="font-serif">Clásica (Serif)</option>
                  <option value="font-mono">Código (Mono)</option>
                  <option value="font-cursive">Cursiva (Script)</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Color de Letra</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer', background: 'transparent', padding: 0 }}
                  />
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{textColor}</span>
                </div>
              </div>
            </div>

            {/* Slider de Tamaño de Fuente */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <span>Tamaño de Letra</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{textSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="60"
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
            </div>

            {/* Slider de Altura (Ajuste Vertical) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <span>Altura / Posición Vertical {isIndependentMug ? (activeSide === "left" ? "(Lado A)" : "(Lado B)") : ""}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{currentTextYOffset}px</span>
              </div>
              <input
                type="range"
                min="-150"
                max="150"
                value={currentTextYOffset}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (isIndependentMug && activeSide === "right") setTextYOffsetRight(val);
                  else setTextYOffset(val);
                }}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
            </div>

            {/* Slider de Curvatura / Deformación de Texto */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <span>Deformar / Curvar Texto {isIndependentMug ? (activeSide === "left" ? "(Lado A)" : "(Lado B)") : ""}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{currentTextCurve}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={currentTextCurve}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (isIndependentMug && activeSide === "right") setTextCurveRight(val);
                  else setTextCurve(val);
                }}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
            </div>

            {/* Configuración de Sombra / Resplandor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="textShadowEnabled"
                  checked={textShadowEnabled}
                  onChange={(e) => setTextShadowEnabled(e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="textShadowEnabled" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>
                  Habilitar sombra o resplandor (Glow)
                </label>
              </div>

              {textShadowEnabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Color de Sombra</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="color"
                          value={textShadowColor}
                          onChange={(e) => setTextShadowColor(e.target.value)}
                          style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', background: 'transparent', padding: 0 }}
                        />
                        <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{textShadowColor}</span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setTextShadowColor(textColor)}
                      style={{ 
                        fontSize: '11px', fontWeight: 600, color: 'var(--primary-light)', background: 'rgba(99, 102, 241, 0.1)', 
                        border: '1px dashed var(--primary)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', cursor: 'pointer',
                        alignSelf: 'flex-end', transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                    >
                      Combinar con texto
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        <span>Difuminado (Blur)</span>
                        <span style={{ fontFamily: 'monospace' }}>{textShadowBlur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={textShadowBlur}
                        onChange={(e) => setTextShadowBlur(Number(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        <span>Desfase (Offset)</span>
                        <span style={{ fontFamily: 'monospace' }}>{textShadowOffset}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={textShadowOffset}
                        onChange={(e) => setTextShadowOffset(Number(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
