"use client";

import React, { useState, useRef } from "react";
import { 
  FileImage, 
  Upload, 
  Download, 
  Trash2, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw,
  Sliders,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ImageItem {
  id: string;
  originalName: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  previewUrl: string;
  file: File;
  status: "idle" | "converting" | "done" | "error";
  webpBlob: Blob | null;
  webpUrl: string | null;
  webpSize: number;
  savingsPercentage: number;
}

export default function WebPConverterPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [maxDimension, setMaxDimension] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFilesSelected = (files: FileList | File[]) => {
    const selectedFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (selectedFiles.length === 0) {
      toast.error("Por favor selecciona archivos de imagen válidos (PNG, JPG, JPEG, GIF, etc.).");
      return;
    }

    const newItems: ImageItem[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      originalName: file.name,
      originalSize: file.size,
      originalWidth: 0,
      originalHeight: 0,
      previewUrl: URL.createObjectURL(file),
      file,
      status: "idle",
      webpBlob: null,
      webpUrl: null,
      webpSize: 0,
      savingsPercentage: 0,
    }));

    setImages((prev) => [...prev, ...newItems]);
    toast.success(`${selectedFiles.length} imagen(es) añadida(s).`);

    setTimeout(() => {
      newItems.forEach((item) => convertSingleImage(item, quality, maxDimension));
    }, 100);
  };

  const convertSingleImage = (
    item: ImageItem,
    targetQuality: number,
    targetMaxDimension: number
  ) => {
    setImages((prev) =>
      prev.map((img) => (img.id === item.id ? { ...img, status: "converting" } : img))
    );

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = item.previewUrl;

    img.onload = () => {
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (targetMaxDimension > 0 && (width > targetMaxDimension || height > targetMaxDimension)) {
        if (width > height) {
          height = Math.round((height * targetMaxDimension) / width);
          width = targetMaxDimension;
        } else {
          width = Math.round((width * targetMaxDimension) / height);
          height = targetMaxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setImages((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "error" } : i))
        );
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const qualityRatio = targetQuality / 100;
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setImages((prev) =>
              prev.map((i) => (i.id === item.id ? { ...i, status: "error" } : i))
            );
            return;
          }

          const webpUrl = URL.createObjectURL(blob);
          const webpSize = blob.size;
          const savings = Math.max(
            0,
            Math.round(((item.originalSize - webpSize) / item.originalSize) * 100)
          );

          setImages((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    originalWidth: img.naturalWidth,
                    originalHeight: img.naturalHeight,
                    status: "done",
                    webpBlob: blob,
                    webpUrl,
                    webpSize,
                    savingsPercentage: savings,
                  }
                : i
            )
          );
        },
        "image/webp",
        qualityRatio
      );
    };

    img.onerror = () => {
      setImages((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "error" } : i))
      );
    };
  };

  const handleReconvertAll = (newQuality: number, newMaxDimension: number) => {
    images.forEach((item) => {
      convertSingleImage(item, newQuality, newMaxDimension);
    });
  };

  const downloadSingle = (item: ImageItem) => {
    if (!item.webpUrl) return;
    const a = document.createElement("a");
    a.href = item.webpUrl;
    const nameWithoutExt = item.originalName.substring(0, item.originalName.lastIndexOf(".")) || item.originalName;
    a.download = `${nameWithoutExt}.webp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = () => {
    const readyItems = images.filter((img) => img.status === "done" && img.webpUrl);
    if (readyItems.length === 0) {
      toast.error("No hay imágenes WebP listas para descargar.");
      return;
    }

    toast.info(`Iniciando descarga de ${readyItems.length} archivo(s)...`);
    readyItems.forEach((item, index) => {
      setTimeout(() => {
        downloadSingle(item);
      }, index * 250);
    });
  };

  const removeItem = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.webpUrl) URL.revokeObjectURL(item.webpUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.webpUrl) URL.revokeObjectURL(item.webpUrl);
    });
    setImages([]);
    toast.info("Lista de imágenes limpiada.");
  };

  const totalOriginalSize = images.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalWebpSize = images.reduce((acc, curr) => acc + (curr.webpSize || curr.originalSize), 0);
  const totalSavedBytes = Math.max(0, totalOriginalSize - totalWebpSize);
  const totalSavingsPct = totalOriginalSize > 0 ? Math.round((totalSavedBytes / totalOriginalSize) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-white/10">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 uppercase tracking-wider">
            <Zap className="h-3.5 w-3.5 text-indigo-600 fill-indigo-600 dark:text-indigo-400 dark:fill-indigo-400" /> Herramienta de Optimización Local
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900 dark:text-white mt-2">
            Optimizador de Imágenes a WebP
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Convierte imágenes PNG, JPG o JPEG al formato WebP optimizado directamente en tu navegador. Reduce hasta un 90% el peso de tus fotos para acelerar la carga de tu catálogo de sublimación.
          </p>
        </div>

        {images.length > 0 && (
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              onClick={clearAll}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-slate-100 text-slate-700 border-slate-200 text-xs font-bold rounded-xl h-9 px-4 dark:bg-white/5 dark:text-white dark:border-white/10 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5 text-slate-500" /> Limpiar Todo
            </Button>
            <Button
              onClick={downloadAll}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl h-9 px-4 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Descargar Todos ({images.filter(i => i.status === "done").length})
            </Button>
          </div>
        )}
      </div>

      {/* Main Grid: Controls & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Panel */}
        <Card className="lg:col-span-4 border-slate-200/80 dark:border-white/10 shadow-xs rounded-3xl bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              Ajustes de Calidad y Formato
            </CardTitle>
            <CardDescription className="text-xs">
              Personaliza la calidad de compresión y el tamaño máximo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            
            {/* Calidad Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Calidad WebP</Label>
                <span className="text-xs font-extrabold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/50 px-2.5 py-0.5 rounded-lg border border-violet-200 dark:border-violet-800">
                  {quality}%
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                step="5"
                value={quality}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setQuality(val);
                  handleReconvertAll(val, maxDimension);
                }}
                className="w-full accent-violet-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>Más Pequeño (40%)</span>
                <span>Recomendado (80%)</span>
                <span>Máxima Calidad (100%)</span>
              </div>
            </div>

            {/* Redimensionado Máximo */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Maximize2 className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                Redimensionar Ancho/Alto Máximo
              </Label>
              <select
                value={maxDimension}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMaxDimension(val);
                  handleReconvertAll(quality, val);
                }}
                className="w-full h-10 px-3 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-xl dark:bg-slate-900 dark:border-white/10 dark:text-white cursor-pointer"
              >
                <option value={0}>Tamaño Original (Sin Redimensionar)</option>
                <option value={2000}>2000 px (Ultra HD Catálogo)</option>
                <option value={1500}>1500 px (Recomendado para Tienda Web)</option>
                <option value={1000}>1000 px (Rápido y Ligero)</option>
                <option value={800}>800 px (Miniaturas / Galería)</option>
              </select>
            </div>

            {/* Total Stats Resume */}
            {images.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/2 border border-slate-200/80 dark:border-white/5 space-y-3 pt-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Resumen de Ahorro Total
                </span>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-white/5">
                    <span className="text-[10px] text-slate-400 block font-semibold">Peso Original</span>
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{formatSize(totalOriginalSize)}</span>
                  </div>
                  <div className="p-2.5 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 rounded-xl border border-violet-200 dark:border-violet-900/40">
                    <span className="text-[10px] text-violet-600 dark:text-violet-400 block font-bold">Peso Optimizado</span>
                    <span className="text-xs font-extrabold text-violet-800 dark:text-violet-200">{formatSize(totalWebpSize)}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/40 text-center">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block">Espacio Ahorrado</span>
                  <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1">
                    <Sparkles className="h-4 w-4" /> {totalSavingsPct}% ({formatSize(totalSavedBytes)})
                  </span>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Dropzone & Image List */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) {
                handleFilesSelected(e.dataTransfer.files);
              }
            }}
            className="border-2 border-dashed border-violet-200 dark:border-violet-900/50 hover:border-violet-400 dark:hover:border-violet-500 bg-violet-50/20 dark:bg-violet-950/10 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 p-8 rounded-3xl text-center cursor-pointer transition-all duration-200 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/gif, image/bmp, image/webp"
              multiple
              onChange={(e) => {
                if (e.target.files) handleFilesSelected(e.target.files);
              }}
              className="hidden"
            />
            <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-violet-200 dark:border-violet-800 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
              <Upload className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="font-heading font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
              Arrastra y suelta tus imágenes aquí
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Soporta archivos PNG, JPG, JPEG, GIF, BMP. El procesamiento se realiza localmente en tu equipo sin subir archivos a servidores externos.
            </p>
            <Button size="sm" className="mt-4 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl h-10 px-5 shadow-md shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all">
              Seleccionar Imágenes de tu Equipo
            </Button>
          </div>

          {/* Image List */}
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Imágenes Procesadas ({images.length})
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Calidad actual: {quality}%
                </span>
              </div>

              <div className="space-y-3">
                {images.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs hover:border-purple-200 dark:hover:border-purple-900 transition-all"
                  >
                    {/* Visual Preview & Title */}
                    <div className="flex items-center gap-3.5 w-full sm:w-auto">
                      <div className="relative h-14 w-14 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center shadow-xs">
                        <img
                          src={item.webpUrl || item.previewUrl}
                          alt={item.originalName}
                          className="object-cover h-full w-full"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                          {item.originalName}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>Original: <b>{formatSize(item.originalSize)}</b></span>
                          {item.originalWidth > 0 && (
                            <>
                              <span>•</span>
                              <span>{item.originalWidth}x{item.originalHeight}px</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* WebP Results & Status */}
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      {item.status === "converting" && (
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Optimizando a WebP...</span>
                        </div>
                      )}

                      {item.status === "done" && (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                              WebP: {formatSize(item.webpSize)}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/40 mt-0.5">
                              <CheckCircle2 className="h-3 w-3" /> -{item.savingsPercentage}% reducido
                            </span>
                          </div>

                          <Button
                            onClick={() => downloadSingle(item)}
                            size="sm"
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl h-8 px-3 gap-1.5 cursor-pointer shadow-xs dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Descargar
                          </Button>
                        </div>
                      )}

                      {item.status === "error" && (
                        <span className="text-xs font-bold text-red-500">Error al convertir</span>
                      )}

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
