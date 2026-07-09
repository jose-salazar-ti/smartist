"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Product, ProductVariant } from "@/services/product-types";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import React from "react";

interface ProductSpecs {
  features: { label: string; value: string }[];
  benefits: string[];
}

// Simulación de conversión y compresión de gama RGB -> CMYK -> RGB para sublimación
function applyCmykSoftProof(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const a = data[i + 3];

    if (a === 0) continue; // Ignorar pixeles transparentes

    // 1. Conversión de RGB a CMYK estándar
    const k = 1 - Math.max(r, g, b);
    let c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    let m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    let y = k === 1 ? 0 : (1 - b - k) / (1 - k);

    // 2. Simulación de tintas físicas de sublimación
    c = c * 0.94;
    m = m * 0.94;
    y = y * 0.88;
    const adjustedK = Math.min(1, k * 0.98); // Ajuste negro rico

    // 3. Conversión de CMYK de vuelta a RGB
    const newR = (1 - c) * (1 - adjustedK);
    const newG = (1 - m) * (1 - adjustedK);
    const newB = (1 - y) * (1 - adjustedK);

    // 4. Calentamiento de tono por transferencia térmica (sublimación tiende a tonos ligeramente más cálidos/rojos)
    // PROTECCIÓN DE BLANCOS: Si el pixel es blanco o casi blanco, no lo teñimos de crema.
    if (newR > 0.95 && newG > 0.95 && newB > 0.95) {
      data[i] = Math.round(newR * 255);
      data[i + 1] = Math.round(newG * 255);
      data[i + 2] = Math.round(newB * 255);
    } else {
      data[i] = Math.round(Math.min(1, newR * 1.02) * 255);
      data[i + 1] = Math.round(Math.min(1, newG * 0.98) * 255);
      data[i + 2] = Math.round(Math.min(1, newB * 0.95) * 255);
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

export function useProductCustomizer(product: Product) {
  const router = useRouter();
  
  // Extraer Specs desde base de datos, usando fallback si no existe
  const productSpecs: ProductSpecs = {
    features: product.features && Array.isArray(product.features) ? product.features : [],
    benefits: product.benefits && Array.isArray(product.benefits) ? product.benefits : ["Este producto es de alta calidad y completamente personalizable."],
  };

  // View mode
  const [viewMode, setViewMode] = useState<"catalog" | "customize">("catalog");
  const [selectedCatalogImage, setSelectedCatalogImage] = useState<string>(product.galleryImages?.[0] || product.imageUrl);

  // Select initial variant
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>(
    product.variants[0].options
  );

  const currentGlbModelUrl = selectedVariant?.glbModelUrl || product.glbModelUrl;
  const currentBlankMockupUrl = selectedVariant?.blankMockupUrl || product.blankMockupUrl;
  const currentMaskImageUrl = selectedVariant?.maskImageUrl || product.maskImageUrl;
  const currentMockupConfig = selectedVariant?.mockupConfig || product.mockupConfig;
  const currentPrintDimensions = selectedVariant?.printDimensions || product.printDimensions;

  // Customization state
  const [customText, setCustomText] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [textFont, setFontFamily] = useState("font-sans");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const [textSize, setTextSize] = useState(28);
  const [textCurve, setTextCurve] = useState(0);
  const [textYOffset, setTextYOffset] = useState(0);
  const [textShadowEnabled, setTextShadowEnabled] = useState(true);
  const [textShadowColor, setTextShadowColor] = useState("#ffffff");
  const [textShadowBlur, setTextShadowBlur] = useState(8);
  const [textShadowOffset, setTextShadowOffset] = useState(0);
  
  // Mug customization modes: "centered" | "duplicated" | "independent"
  const [mugDesignMode, setMugDesignMode] = useState<"centered" | "duplicated" | "independent">("centered");
  const [activeSide, setActiveSide] = useState<"left" | "right">("left");

  // Backwards compatibility duplication states
  const [duplicateImage, setDuplicateImage] = useState(false);
  const [duplicateText, setDuplicateText] = useState(false);
  
  // Image Upload state (Left/Lado A)
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [dpiStatus, setDpiStatus] = useState<"idle" | "low" | "high">("idle");

  // Transform sliders state (Left/Lado A)
  const [imageScale, setImageScale] = useState(100); // percentage 10% - 200%
  const [imageX, setImageX] = useState(0); // px offset
  const [imageY, setImageY] = useState(0); // px offset
  const [imageRotation, setImageRotation] = useState(0); // degrees

  // Right-side (Lado B) state variables
  const [imageSrcRight, setImageSrcRight] = useState<string | null>(null);
  const [imageNameRight, setImageNameRight] = useState<string>("");
  const [imageWidthRight, setImageWidthRight] = useState(0);
  const [imageHeightRight, setImageHeightRight] = useState(0);
  const [dpiStatusRight, setDpiStatusRight] = useState<"idle" | "low" | "high">("idle");
  const [imageScaleRight, setImageScaleRight] = useState(100);
  const [imageXRight, setImageXRight] = useState(0);
  const [imageYRight, setImageYRight] = useState(0);
  const [imageRotationRight, setImageRotationRight] = useState(0);

  // Independent texts (Lado B text content, curved and offset)
  const [customTextRight, setCustomTextRight] = useState("");
  const [textYOffsetRight, setTextYOffsetRight] = useState(0);
  const [textCurveRight, setTextCurveRight] = useState(0);

  // Quantity State
  const [quantity, setQuantity] = useState(1);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preloaded image ref & render trigger for canvas warping
  const uploadedImageRef = useRef<HTMLImageElement | null>(null);
  const uploadedImageRightRef = useRef<HTMLImageElement | null>(null);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [warpedPreview, setWarpedPreview] = useState<string | null>(null);
  const [exportPreview, setExportPreview] = useState<string | null>(null);
  const [watermarkedPreview, setWatermarkedPreview] = useState<string | null>(null);
  const cmykTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Preload image when imageSrc changes
  useEffect(() => {
    if (!imageSrc) {
      uploadedImageRef.current = null;
      setRenderTrigger(prev => prev + 1);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      uploadedImageRef.current = img;
      setRenderTrigger(prev => prev + 1);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Preload right image when imageSrcRight changes
  useEffect(() => {
    if (!imageSrcRight) {
      uploadedImageRightRef.current = null;
      setRenderTrigger(prev => prev + 1);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      uploadedImageRightRef.current = img;
      setRenderTrigger(prev => prev + 1);
    };
    img.src = imageSrcRight;
  }, [imageSrcRight]);

  const isMug = product.category.toLowerCase() === "tazas" || product.id.includes("taza");
  const isIndependentMug = isMug && mugDesignMode === "independent";

  // Canvas Warping engine to map designs onto cylindrical shape
  useEffect(() => {
    const printY = isMug ? 0 : 20;
    const printHeight = isMug ? 384 : 344;

    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = 1024;
    srcCanvas.height = 384;
    const srcCtx = srcCanvas.getContext("2d");
    if (!srcCtx) return;

    // Para permitir edición en CorelDRAW, el fondo debe ser transparente.
    srcCtx.clearRect(0, 0, srcCanvas.width, srcCanvas.height);
    
    // Píxeles ancla invisibles en las esquinas (1% opacidad) para evitar que algunos programas 
    // o visores recorten la imagen y pierdan la medida de la plantilla 1024x384.
    srcCtx.fillStyle = "rgba(255, 255, 255, 0.01)";
    srcCtx.fillRect(0, 0, 1, 1);
    srcCtx.fillRect(srcCanvas.width - 1, srcCanvas.height - 1, 1, 1);
    const centerX = 512;
    const centerY = 192;

    // Helper to draw user image with transform params
    const drawUserImage = (img: HTMLImageElement, cx: number, scaleVal: number, xVal: number, yVal: number, rotVal: number) => {
      srcCtx.save();
      // Clip to printable area (split in half for split mugs to avoid overlap)
      srcCtx.beginPath();
      const isSplitMug = isMug && (mugDesignMode === "independent" || mugDesignMode === "duplicated");
      if (isSplitMug) {
        if (cx < centerX) {
          srcCtx.rect(104, printY, 408, printHeight);
        } else {
          srcCtx.rect(512, printY, 408, printHeight);
        }
      } else {
        srcCtx.rect(104, printY, 816, printHeight);
      }
      srcCtx.clip();

      // Apply translation from slider offsets (scale offset so 1px = 2px in 1024 grid)
      srcCtx.translate(cx + xVal * 2, centerY + yVal * 2);
      srcCtx.rotate((rotVal * Math.PI) / 180);
      
      const scale = scaleVal / 100;
      const imgWidth = img.width;
      const imgHeight = img.height;
      
      // Target dimensions based on mode
      const targetWidth = isSplitMug ? 408 : 816;
      const targetHeight = printHeight;

      // Auto-fit image to COVER the target area by default
      const imgRatio = imgWidth / imgHeight;
      const targetRatio = targetWidth / targetHeight;
      
      let renderWidth, renderHeight;
      if (imgRatio > targetRatio) {
        // Image is wider than target area. Scale to height and let width overflow (crop).
        renderHeight = targetHeight * scale;
        renderWidth = renderHeight * imgRatio;
      } else {
        // Image is narrower than target area. Scale to width and let height overflow (crop).
        renderWidth = targetWidth * scale;
        renderHeight = renderWidth / imgRatio;
      }
      
      srcCtx.drawImage(
        img, 
        -renderWidth / 2, 
        -renderHeight / 2, 
        renderWidth, 
        renderHeight
      );
      srcCtx.restore();
    };

    // 1. Draw User Image with position, scale and rotation transforms based on design mode
    if (isMug) {
      if (mugDesignMode === "independent") {
        if (uploadedImageRef.current) {
          drawUserImage(uploadedImageRef.current, centerX - 204, imageScale, imageX, imageY, imageRotation);
        }
        if (uploadedImageRightRef.current) {
          drawUserImage(uploadedImageRightRef.current, centerX + 204, imageScaleRight, imageXRight, imageYRight, imageRotationRight);
        }
      } else if (mugDesignMode === "duplicated") {
        if (uploadedImageRef.current) {
          drawUserImage(uploadedImageRef.current, centerX - 204, imageScale, imageX, imageY, imageRotation);
          drawUserImage(uploadedImageRef.current, centerX + 204, imageScale, imageX, imageY, imageRotation);
        }
      } else {
        // Centered
        if (uploadedImageRef.current) {
          drawUserImage(uploadedImageRef.current, centerX, imageScale, imageX, imageY, imageRotation);
        }
      }
    } else {
      // Not a mug
      if (uploadedImageRef.current) {
        drawUserImage(uploadedImageRef.current, centerX, imageScale, imageX, imageY, imageRotation);
      }
    }

    // Helper to draw user text with curvature and offsets
    const drawUserText = (textStr: string, cx: number, yOffsetVal: number, curveVal: number) => {
      srcCtx.save();
      // Clip to printable area (split in half for split mugs to avoid overlap)
      srcCtx.beginPath();
      const isSplitMug = isMug && (mugDesignMode === "independent" || mugDesignMode === "duplicated");
      if (isSplitMug) {
        if (cx < centerX) {
          srcCtx.rect(104, printY, 408, printHeight);
        } else {
          srcCtx.rect(512, printY, 408, printHeight);
        }
      } else {
        srcCtx.rect(104, printY, 816, printHeight);
      }
      srcCtx.clip();

      srcCtx.fillStyle = textColor;

      let fontName = "Arial";
      if (textFont === "font-serif") fontName = "Georgia, serif";
      else if (textFont === "font-mono") fontName = "Courier New, monospace";
      else if (textFont === "font-cursive") fontName = "Brush Script MT, cursive, sans-serif";
      
      const fontStyle = `${textItalic ? "italic" : ""} ${textBold ? "bold" : ""} ${textSize}px ${fontName}`.trim();
      srcCtx.font = fontStyle;
      
      // Shadow settings
      if (textShadowEnabled) {
        srcCtx.shadowColor = textShadowColor;
        srcCtx.shadowBlur = textShadowBlur;
        srcCtx.shadowOffsetX = textShadowOffset;
        srcCtx.shadowOffsetY = textShadowOffset;
      } else {
        srcCtx.shadowBlur = 0;
        srcCtx.shadowOffsetX = 0;
        srcCtx.shadowOffsetY = 0;
        srcCtx.shadowColor = "transparent";
      }
      
      const lines = textStr.split("\n");
      const lineHeight = textSize * 1.25;
      const blockHeight = (lines.length - 1) * lineHeight;

      const hasImageOnThisSide = isMug 
        ? (mugDesignMode === "independent" 
            ? (cx < centerX ? !!imageSrc : !!imageSrcRight) 
            : !!imageSrc)
        : !!imageSrc;
      
      const textY = (hasImageOnThisSide ? centerY + 90 : centerY) + yOffsetVal * 2;
      const startY = textY - blockHeight / 2;

      if (curveVal === 0) {
        // Normal Straight Multiline Text
        srcCtx.textAlign = textAlign;
        srcCtx.textBaseline = "middle";

        let textX = cx;
        if (isMug && (mugDesignMode === "independent" || mugDesignMode === "duplicated")) {
          if (textAlign === "left") textX = cx - 80;
          else if (textAlign === "right") textX = cx + 80;
        } else {
          if (textAlign === "left") textX = cx - 204;
          else if (textAlign === "right") textX = cx + 204;
        }

        lines.forEach((line, index) => {
          const lineY = startY + index * lineHeight;
          srcCtx.fillText(line, textX, lineY);
        });
      } else {
        // Curved Multiline Text
        srcCtx.textBaseline = "middle";
        srcCtx.textAlign = "center";

        const R = Math.max(180, 15000 / Math.abs(curveVal));
        const isSmile = curveVal > 0;

        // Base center Y depending on curvature direction
        const cy = isSmile ? (textY + R) : (textY - R);
        
        let targetCx = cx;
        if (!(isMug && (mugDesignMode === "independent" || mugDesignMode === "duplicated"))) {
          targetCx = textAlign === "left" ? (centerX - 204) : (textAlign === "right" ? (centerX + 204) : centerX);
        } else {
          if (textAlign === "left") targetCx = cx - 80;
          else if (textAlign === "right") targetCx = cx + 80;
        }

        lines.forEach((line, lineIdx) => {
          const lineOffset = (lineIdx - (lines.length - 1) / 2) * lineHeight;
          const R_line = isSmile ? (R - lineOffset) : (R + lineOffset);

          const chars = Array.from(line);
          if (chars.length === 0) return;

          // Measure character widths
          let totalWidth = 0;
          const charWidths = chars.map(char => {
            const w = srcCtx.measureText(char).width;
            totalWidth += w;
            return w;
          });

          // Calculate offset relative to alignment
          let currentS = 0;
          const charOffsets = charWidths.map(w => {
            const offset = currentS + w / 2;
            currentS += w;
            return offset;
          });

          chars.forEach((char, charIdx) => {
            const offset = charOffsets[charIdx] - totalWidth / 2;
            const angle = offset / R_line;

            let x, y, rotation;
            if (isSmile) {
              x = targetCx + R_line * Math.sin(angle);
              y = cy - R_line * Math.cos(angle);
              rotation = angle;
            } else {
              x = targetCx + R_line * Math.sin(angle);
              y = cy + R_line * Math.cos(angle);
              rotation = -angle;
            }

            srcCtx.save();
            srcCtx.translate(x, y);
            srcCtx.rotate(rotation);
            srcCtx.fillText(char, 0, 0);
            srcCtx.restore();
          });
        });
      }
      srcCtx.restore();
    };

    // 2. Draw Custom Text based on design mode
    if (isMug) {
      if (mugDesignMode === "independent") {
        if (customText.trim()) {
          drawUserText(customText, centerX - 204, textYOffset, textCurve);
        }
        if (customTextRight.trim()) {
          drawUserText(customTextRight, centerX + 204, textYOffsetRight, textCurveRight);
        }
      } else if (mugDesignMode === "duplicated") {
        if (customText.trim()) {
          drawUserText(customText, centerX - 204, textYOffset, textCurve);
          drawUserText(customText, centerX + 204, textYOffset, textCurve);
        }
      } else {
        // Centered
        if (customText.trim()) {
          drawUserText(customText, centerX, textYOffset, textCurve);
        }
      }
    } else {
      // Not a mug
      if (customText.trim()) {
        drawUserText(customText, centerX, textYOffset, textCurve);
      }
    }

    // Clean up any pending CMYK filter timeout
    if (cmykTimeoutRef.current) {
      clearTimeout(cmykTimeoutRef.current);
    }

    // Helper function to extract the exact printable area without the dead zones (104px margins)
    const exportPrintReadyBase64 = () => {
      if (!isMug) return srcCanvas.toDataURL("image/png");
      const exportCanvas = document.createElement("canvas");
      // 816x384 is exactly 20.02 cm proportion
      exportCanvas.width = 816;
      exportCanvas.height = 384;
      const exportCtx = exportCanvas.getContext("2d");
      if (!exportCtx) return srcCanvas.toDataURL("image/png");
      // Draw only the center 816px from the 1024px source canvas
      exportCtx.drawImage(srcCanvas, 104, 0, 816, 384, 0, 0, 816, 384);
      return exportCanvas.toDataURL("image/png");
    };

    // Helper to generate a low-res watermarked thumbnail to prevent F12 copy stealing
    const exportWatermarkedThumbnail = () => {
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = 300;
      exportCanvas.height = 141;
      const exportCtx = exportCanvas.getContext("2d");
      if (!exportCtx) return "";
      
      if (isMug) {
        exportCtx.drawImage(srcCanvas, 104, 0, 816, 384, 0, 0, 300, 141);
      } else {
        exportCtx.drawImage(srcCanvas, 0, 0, srcCanvas.width, srcCanvas.height, 0, 0, 300, 141);
      }
      
      // Draw diagonal repeating watermark text
      exportCtx.save();
      exportCtx.rotate(-20 * Math.PI / 180);
      exportCtx.font = "bold 13px sans-serif";
      exportCtx.fillStyle = "rgba(99, 102, 241, 0.22)";
      for (let y = -50; y < 200; y += 40) {
        for (let x = -100; x < 400; x += 110) {
          exportCtx.fillText("SMARTIST", x, y);
        }
      }
      exportCtx.restore();
      return exportCanvas.toDataURL("image/jpeg", 0.75);
    };

    // Set the instant, smooth preview for the 3D Mug (Full 1024x384 so it wraps correctly)
    setWarpedPreview(srcCanvas.toDataURL("image/png"));
    setExportPreview(exportPrintReadyBase64());
    setWatermarkedPreview(exportWatermarkedThumbnail());

    // Schedule the heavy CMYK soft-proof filter to run after 200ms of inactivity
    cmykTimeoutRef.current = setTimeout(() => {
      applyCmykSoftProof(srcCtx, srcCanvas.width, srcCanvas.height);
      setWarpedPreview(srcCanvas.toDataURL("image/png"));
      setExportPreview(exportPrintReadyBase64());
      setWatermarkedPreview(exportWatermarkedThumbnail());
    }, 200);

    return () => {
      if (cmykTimeoutRef.current) {
        clearTimeout(cmykTimeoutRef.current);
      }
    };
  }, [
    imageSrc,
    imageScale,
    imageX,
    imageY,
    imageRotation,
    customText,
    textColor,
    textFont,
    textAlign,
    textBold,
    textItalic,
    textSize,
    textCurve,
    textYOffset,
    textShadowEnabled,
    textShadowColor,
    textShadowBlur,
    textShadowOffset,
    duplicateImage,
    duplicateText,
    renderTrigger,
    product.category,
    product.id,
    mugDesignMode,
    activeSide,
    imageSrcRight,
    imageScaleRight,
    imageXRight,
    imageYRight,
    imageRotationRight,
    customTextRight,
    textYOffsetRight,
    textCurveRight,
    isMug
  ]);

  // Find variant when options change
  useEffect(() => {
    const matched = product.variants.find(variant => {
      return Object.entries(selectedOptions).every(([key, value]) => {
        return variant.options[key] === value;
      });
    });
    if (matched) {
      setSelectedVariant(matched);
    }
  }, [selectedOptions, product.variants]);

  // Handle option changes
  const handleOptionChange = (optionKey: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionKey]: value }));
  };

  // Process uploaded image and verify DPI
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Formato no válido. Sube una imagen PNG o JPG.");
      return;
    }

    const nameToSet = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      
      const img = new window.Image();
      img.onload = () => {
        const w = img.width;
        const h = img.height;
        
        let dpiVal: "low" | "high" = "high";
        if (w < 1000 || h < 1000) {
          dpiVal = "low";
          toast.warning("Imagen cargada, pero la resolución es baja para impresión.");
        } else {
          dpiVal = "high";
          toast.success("Imagen de alta resolución cargada con éxito.");
        }
        
        const isIndependentMug = (product.category.toLowerCase() === "tazas" || product.id.includes("taza")) && mugDesignMode === "independent";
        
        if (isIndependentMug && activeSide === "right") {
          setImageNameRight(nameToSet);
          setImageWidthRight(w);
          setImageHeightRight(h);
          setDpiStatusRight(dpiVal);
          setImageSrcRight(dataUrl);
        } else {
          setImageName(nameToSet);
          setImageWidth(w);
          setImageHeight(h);
          setDpiStatus(dpiVal);
          setImageSrc(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Add to cart action
  const handleAddToCart = () => {
    const isCustomized = !!(imageSrc || customText.trim() || imageSrcRight || customTextRight.trim());

    const cartItem = {
      id: `${selectedVariant.id}-${Date.now()}`,
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      variantTitle: selectedVariant.title,
      price: Number(selectedVariant.price),
      quantity,
      productImage: isCustomized ? (watermarkedPreview || selectedVariant.imageUrl || product.imageUrl || "") : (selectedVariant.imageUrl || product.imageUrl || ""),
      customDesignBase64: isCustomized ? (exportPreview || warpedPreview || undefined) : undefined,
    };

    try {
      useCartStore.getState().addItem(cartItem);
      
      toast.success("¡Agregado al carrito exitosamente!", {
        description: `${quantity}x ${selectedVariant.title} - S/. ${(cartItem.price * quantity).toFixed(2)}`,
        icon: React.createElement("span", { className: "h-4 w-4 text-green-500" }, "🛒"),
      });

      // Si el producto es personalizable pero no se ha personalizado, mostrar recordatorio amigable
      if (product.isCustomizable && !isCustomized) {
        setTimeout(() => {
          toast.info("¿Sabías que puedes personalizarlo?", {
            description: "Puedes agregar fotos y texto gratis a este producto usando la pestaña 'Personalizar'.",
            duration: 6000,
          });
        }, 1000);
      }
      
    } catch (error) {
      console.error("Error al guardar en el carrito:", error);
      toast.error("Hubo un error al agregar al carrito.");
    }
  };

  // Define dynamic print area styling according to category
  const getPrintAreaStyle = () => {
    const cat = product.category.toLowerCase();
    const name = product.name.toLowerCase();
    
    const baseStyle: any = {
      border: "1px dashed rgba(99, 102, 241, 0.4)",
      mixBlendMode: "multiply", // Hace que la imagen absorba las luces y sombras del fondo
    };

    // 1. Detectar formas por máscara de la Base de Datos
    if (currentMaskImageUrl) {
      baseStyle.WebkitMaskImage = `url("${currentMaskImageUrl}")`;
      baseStyle.maskImage = `url("${currentMaskImageUrl}")`;
      baseStyle.WebkitMaskSize = "100% 100%";
      baseStyle.maskSize = "100% 100%";
      baseStyle.WebkitMaskRepeat = "no-repeat";
      baseStyle.maskRepeat = "no-repeat";
      baseStyle.border = "none";
      return { ...baseStyle, width: "100%", height: "100%", top: "0", left: "0" };
    }
    // 2. Detectar formas por el nombre del producto (Legacy / Hardcoded)
    else if (name.includes("redondo") || name.includes("circulo") || name.includes("círculo")) {
      baseStyle.WebkitMaskImage = "radial-gradient(circle, black 49%, transparent 50%)";
      baseStyle.maskImage = "radial-gradient(circle, black 49%, transparent 50%)";
      baseStyle.borderRadius = "50%";
      baseStyle.border = "none";
    } else if (name.includes("corazón") || name.includes("corazon") || product.id.includes("heart")) {
      const heartSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='M50,90 C25,78 5,54 5,32 A21,21 0 0 1 26.5,10.5 C38.6,10.5 46.3,18.2 50,22.5 C53.7,18.2 61.4,10.5 73.5,10.5 A21,21 0 0 1 95,32 C95,54 75,78 50,90 Z' fill='black'/></svg>";
      baseStyle.WebkitMaskImage = `url("${heartSvg}")`;
      baseStyle.maskImage = `url("${heartSvg}")`;
      baseStyle.WebkitMaskSize = "100% 100%";
      baseStyle.maskSize = "100% 100%";
      baseStyle.WebkitMaskRepeat = "no-repeat";
      baseStyle.maskRepeat = "no-repeat";
      baseStyle.border = "none";
    }

    // 2. Definir tamaños por categoría
    switch (cat) {
      case "tazas":
        return { ...baseStyle, width: "35%", height: "45%", top: "28%", left: "32%", borderRadius: "4px" };
      case "ropa":
        return { ...baseStyle, width: "36%", height: "44%", top: "28%", left: "32%" };
      case "oficina":
        return { ...baseStyle, width: name.includes("redondo") ? "60%" : "74%", height: name.includes("redondo") ? "60%" : "74%", top: name.includes("redondo") ? "20%" : "13%", left: name.includes("redondo") ? "20%" : "13%", borderRadius: baseStyle.borderRadius || "8px" };
      default:
        if (name.includes("fotoroca")) {
          return { ...baseStyle, width: "80%", height: "80%", top: "10%", left: "10%", borderRadius: "4px" };
        }
        return { ...baseStyle, width: "50%", height: "50%", top: "25%", left: "25%" };
    }
  };

  const currentHasImage = isIndependentMug ? (activeSide === "left" ? !!imageSrc : !!imageSrcRight) : !!imageSrc;
  const currentImageName = isIndependentMug ? (activeSide === "left" ? imageName : imageNameRight) : imageName;
  const currentImageWidth = isIndependentMug ? (activeSide === "left" ? imageWidth : imageWidthRight) : imageWidth;
  const currentImageHeight = isIndependentMug ? (activeSide === "left" ? imageHeight : imageHeightRight) : imageHeight;
  const currentDpiStatus = isIndependentMug ? (activeSide === "left" ? dpiStatus : dpiStatusRight) : dpiStatus;
  
  const currentImageScale = isIndependentMug ? (activeSide === "left" ? imageScale : imageScaleRight) : imageScale;
  const currentImageX = isIndependentMug ? (activeSide === "left" ? imageX : imageXRight) : imageX;
  const currentImageY = isIndependentMug ? (activeSide === "left" ? imageY : imageYRight) : imageY;
  const currentImageRotation = isIndependentMug ? (activeSide === "left" ? imageRotation : imageRotationRight) : imageRotation;
  
  const currentCustomText = isIndependentMug ? (activeSide === "left" ? customText : customTextRight) : customText;
  const currentTextYOffset = isIndependentMug ? (activeSide === "left" ? textYOffset : textYOffsetRight) : textYOffset;
  const currentTextCurve = isIndependentMug ? (activeSide === "left" ? textCurve : textCurveRight) : textCurve;

  const optionKeys = Array.from(
    new Set(product.variants.flatMap(v => Object.keys(v.options)))
  );

  const getOptionValues = (key: string) => {
    return Array.from(new Set(product.variants.map(v => v.options[key])));
  };

  const totalPrice = Number(selectedVariant.price) * quantity;

  const resetCustomization = () => {
    setCustomText("");
    setCustomTextRight("");
    setTextColor("#000000");
    setFontFamily("font-sans");
    setTextAlign("center");
    setTextBold(false);
    setTextItalic(false);
    setTextSize(28);
    setTextCurve(0);
    setTextCurveRight(0);
    setTextYOffset(0);
    setTextYOffsetRight(0);
    setTextShadowEnabled(true);
    setTextShadowColor("#ffffff");
    setTextShadowBlur(8);
    setTextShadowOffset(0);
    
    setImageSrc(null);
    setWatermarkedPreview(null);
    setImageName("");
    setImageWidth(0);
    setImageHeight(0);
    setDpiStatus("idle");
    setImageScale(100);
    setImageX(0);
    setImageY(0);
    setImageRotation(0);
    
    setImageSrcRight(null);
    setImageNameRight("");
    setImageWidthRight(0);
    setImageHeightRight(0);
    setDpiStatusRight("idle");
    setImageScaleRight(100);
    setImageXRight(0);
    setImageYRight(0);
    setImageRotationRight(0);
    
    setMugDesignMode("centered");
    setActiveSide("left");
    setDuplicateImage(false);
    setDuplicateText(false);
    setQuantity(1);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    toast.success("Diseño restablecido por defecto.");
  };


  return {
    // State & Setters
    viewMode,
    setViewMode,
    selectedCatalogImage,
    setSelectedCatalogImage,
    selectedVariant,
    setSelectedVariant,
    selectedOptions,
    setSelectedOptions,
    customText,
    setCustomText,
    textColor,
    setTextColor,
    textFont,
    setFontFamily,
    textAlign,
    setTextAlign,
    textBold,
    setTextBold,
    textItalic,
    setTextItalic,
    textSize,
    setTextSize,
    textCurve,
    setTextCurve,
    textYOffset,
    setTextYOffset,
    textShadowEnabled,
    setTextShadowEnabled,
    textShadowColor,
    setTextShadowColor,
    textShadowBlur,
    setTextShadowBlur,
    textShadowOffset,
    setTextShadowOffset,
    mugDesignMode,
    setMugDesignMode,
    activeSide,
    setActiveSide,
    duplicateImage,
    setDuplicateImage,
    duplicateText,
    setDuplicateText,
    imageSrc,
    setImageSrc,
    imageName,
    setImageName,
    imageWidth,
    setImageWidth,
    imageHeight,
    setImageHeight,
    dpiStatus,
    setDpiStatus,
    imageScale,
    setImageScale,
    imageX,
    setImageX,
    imageY,
    setImageY,
    imageRotation,
    setImageRotation,
    imageSrcRight,
    setImageSrcRight,
    imageNameRight,
    setImageNameRight,
    imageWidthRight,
    setImageWidthRight,
    imageHeightRight,
    setImageHeightRight,
    dpiStatusRight,
    setDpiStatusRight,
    imageScaleRight,
    setImageScaleRight,
    imageXRight,
    setImageXRight,
    imageYRight,
    setImageYRight,
    imageRotationRight,
    setImageRotationRight,
    customTextRight,
    setCustomTextRight,
    textYOffsetRight,
    setTextYOffsetRight,
    textCurveRight,
    setTextCurveRight,
    quantity,
    setQuantity,
    isProcessing,
    setIsProcessing,
    warpedPreview,
    setWarpedPreview,
    exportPreview,
    setExportPreview,
    setRenderTrigger,

    // Computed
    productSpecs,
    currentGlbModelUrl,
    currentBlankMockupUrl,
    currentMaskImageUrl,
    currentMockupConfig,
    currentPrintDimensions,
    isMug,
    isIndependentMug,
    currentHasImage,
    currentImageName,
    currentImageWidth,
    currentImageHeight,
    currentDpiStatus,
    currentImageScale,
    currentImageX,
    currentImageY,
    currentImageRotation,
    currentCustomText,
    currentTextYOffset,
    currentTextCurve,
    optionKeys,
    totalPrice,

    // Refs & handlers
    fileInputRef,
    uploadedImageRef,
    uploadedImageRightRef,
    getOptionValues,
    handleOptionChange,
    handleImageUpload,
    triggerFileUpload,
    handleAddToCart,
    getPrintAreaStyle,
    resetCustomization,
  };
}

export type ProductCustomizerHook = ReturnType<typeof useProductCustomizer>;
