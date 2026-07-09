"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Heart, Gift, Sparkles, Laptop, BookOpen, Music, Image as ImageIcon, 
  Upload, Share2, Copy, Check, Loader2, RefreshCw, Trash2, ArrowRight, ArrowLeft
} from "lucide-react";
import { getCategoryIconByKey } from "@/components/ui/icons";
import { DEDICATION_TEMPLATES, DedicationTemplate } from "@/lib/templates.config";
import { SpotifyPlayerPremium } from "@/components/ui/SpotifyPlayerPremium";
import { StackedPhotos } from "@/components/ui/StackedPhotos";

export default function CrearDedicatoriaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";

  // Form State
  const [remitente, setRemitente] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [imagenUrls, setImagenUrls] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [spotifyInput, setSpotifyInput] = useState("");
  const [spotifyUri, setSpotifyUri] = useState<string | null>(null);
  
  // Visualizer and Audio Source Customizer States
  const [visualizerType, setVisualizerType] = useState<"stack" | "universe" | "hanging">("stack");
  const [audioType, setAudioType] = useState<"spotify" | "youtube" | "upload">("spotify");
  const [youtubeInput, setYoutubeInput] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Pattern Generator State
  const [patronKey, setPatronKey] = useState("cats-hearts");
  const [bgColor, setBgColor] = useState("#fdf8f5"); // Cream default
  const [bgClass, setBgClass] = useState("from-pink-500/20 to-purple-600/20");
  const [textColor, setTextColor] = useState("text-purple-950 dark:text-purple-100");
  
  const isDarkBg = bgColor === "#1e1e24" || !bgColor || bgColor === "default";
  
  // UI States
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Preloaded Preset Colors
  const bgPresets = [
    { value: "#fdf8f5", label: "Crema", text: "text-slate-900" },
    { value: "#fff0f6", label: "Rosa", text: "text-pink-950" },
    { value: "#f0f4ff", label: "Celeste", text: "text-blue-950" },
    { value: "#e6fcf5", label: "Menta", text: "text-teal-950" },
    { value: "#1e1e24", label: "Charcoal", text: "text-white" }
  ];

  // List of available pattern icons
  const patternIcons = [
    { key: "cats-hearts", label: "Gatos & Amor" },
    { key: "heart", label: "Corazones" },
    { key: "gift", label: "Regalos" },
    { key: "sparkles", label: "Estrellas" },
    { key: "laptop", label: "Oficina" },
    { key: "taza", label: "Tazas" },
    { key: "ropa", label: "Ropa" },
    { key: "cap", label: "Gorras" },
    { key: "bottle", label: "Botellas" },
    { key: "puzzle", label: "Puzzle" }
  ];

  // Resolve Spotify URI from Input URL
  useEffect(() => {
    if (!spotifyInput.trim()) {
      setSpotifyUri(null);
      return;
    }
    
    // Extract Track ID from URL
    // e.g. https://open.spotify.com/track/1u8c2t2C7gAxbj42cyFYrj?si=...
    const match = spotifyInput.match(/track\/([a-zA-Z0-9]+)/);
    if (match && match[1]) {
      setSpotifyUri(`spotify:track:${match[1]}`);
    } else if (spotifyInput.startsWith("spotify:track:")) {
      setSpotifyUri(spotifyInput);
    } else {
      setSpotifyUri(null);
    }
  }, [spotifyInput]);

  // Apply Template presets
  const applyTemplate = (template: DedicationTemplate) => {
    setMensaje(template.defaultMessage);
    setPatronKey(template.defaultPatronKey);
    setBgClass(template.themeColor);
    setTextColor(template.textColor);
    if (template.spotifyUri) {
      setSpotifyInput(`https://open.spotify.com/track/${template.spotifyUri.split(":")[2]}`);
    } else {
      setSpotifyInput("");
    }
  };

  const getBgGradient = (color?: string | null) => {
    switch (color) {
      case "#fdf8f5":
        return "from-[#fdf8f5] to-[#f4ebe6]";
      case "#fff0f6":
        return "from-[#fff0f6] to-[#ffd8e6]";
      case "#f0f4ff":
        return "from-[#f0f4ff] to-[#d6e4ff]";
      case "#e6fcf5":
        return "from-[#e6fcf5] to-[#c3fae8]";
      case "#1e1e24":
        return "from-[#22222b] via-[#1a1a20] to-[#0e0e12]";
      default:
        return "from-[#8a63e5] via-[#a356db] to-[#c949c8]";
    }
  };

  // Upload Photo Handler (Local Preview only)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];

    for (const file of newFiles) {
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        alert(`El archivo ${file.name} excede el tamaño máximo de 5MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Append to existing files
    setImageFiles(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagenUrls(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Submit Handler
  const handleSave = async () => {
    if (!remitente.trim() || !destinatario.trim() || !mensaje.trim()) {
      alert("Por favor completa los campos obligatorios: De parte de, Para y Mensaje.");
      return;
    }

    setSaving(true);
    let finalImageUrl = "";
    let finalAudioUri = "";

    try {
      // 1. Upload local images
      const uploadedUrls: string[] = [];

      for (const file of imageFiles) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "disenos-personalizados");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json();
          throw new Error(uploadErr.error || "Error al subir la imagen al servidor.");
        }

        const uploadData = await uploadRes.json();
        if (uploadData && uploadData.url) {
          uploadedUrls.push(uploadData.url);
        }
      }

      finalImageUrl = uploadedUrls.join(",");

      // 2. Upload local audio file if set
      if (audioType === "upload" && audioFile) {
        setUploading(true);
        const audioFormData = new FormData();
        audioFormData.append("file", audioFile);
        audioFormData.append("type", "audio");

        const audioRes = await fetch("/api/upload", {
          method: "POST",
          body: audioFormData
        });

        if (!audioRes.ok) {
          const uploadErr = await audioRes.json();
          throw new Error(uploadErr.error || "Error al subir el archivo de audio.");
        }

        const audioData = await audioRes.json();
        if (audioData && audioData.url) {
          finalAudioUri = `upload:${audioData.url}`;
        }
      } else if (audioType === "youtube") {
        const ytId = getYouTubeId(youtubeInput);
        if (ytId) {
          finalAudioUri = `youtube:${ytId}`;
        } else if (youtubeInput.trim()) {
          finalAudioUri = `youtube:${youtubeInput.trim()}`;
        }
      } else if (audioType === "spotify") {
        finalAudioUri = spotifyUri || "";
      }

      // Encode visualizer type into patronKey
      const encodedPatronKey = `${patronKey}:${visualizerType}`;

      const res = await fetch("/api/dedicatorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId || null,
          remitente,
          destinatario,
          mensaje,
          imagenUrl: finalImageUrl,
          spotifyUri: finalAudioUri,
          patronKey: encodedPatronKey,
          bgColor
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedId(data.id);
      } else {
        const err = await res.json();
        alert(err.error || "Error al guardar dedicatoria");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Ocurrió un error inesperado al conectar con el servidor.");
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  // Copy shareable link
  const copyLink = () => {
    if (!createdId) return;
    const shareUrl = `${window.location.origin}/regalo/${createdId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format Spotify Embed URL
  const getSpotifyEmbedUrl = () => {
    if (!spotifyUri) return "";
    const trackId = spotifyUri.split(":")[2];
    return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-28 pb-16 transition-colors">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-3">
            <Sparkles className="h-3 w-3" /> Regala con Inteligencia Emocional
          </span>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Diseña tu <span className="gradient-text">Dedicatoria Digital</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Personaliza el fondo, escribe tus sentimientos y añade música para sorprender al destinatario en su celular.
          </p>
        </div>

        {/* Success Screen */}
        {createdId ? (
          <div className="max-w-md mx-auto bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 shadow-2xl rounded-3xl p-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-6 shadow-inner">
              <Check className="h-8 w-8" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">¡Experiencia Creada!</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Tu dedicatoria digital se guardó exitosamente. Comparte el enlace con tu persona favorita o imprímelo en el taller.
            </p>

            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-150 dark:border-white/5 rounded-2xl p-4 mb-6 select-all font-mono text-xs text-slate-700 dark:text-slate-300 break-all relative">
              {`${window.location.origin}/regalo/${createdId}`}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={copyLink}
                className="flex items-center justify-center gap-2 h-11 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copiar Link
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`¡Tengo una sorpresa especial para ti! Abre este enlace desde tu celular: ${window.location.origin}/regalo/${createdId}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-11 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Share2 className="h-4 w-4" /> WhatsApp
              </a>
            </div>

            <button
              onClick={() => {
                setCreatedId(null);
                setRemitente("");
                setDestinatario("");
                setMensaje("");
                setImagenUrls([]);
                setImageFiles([]);
                setSpotifyInput("");
              }}
              className="mt-6 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Crear otra dedicatoria
            </button>
          </div>
        ) : (
          
          /* Creator Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 shadow-2xl rounded-3xl p-6 md:p-8 space-y-6">
              
              {/* Tabs for mobile view */}
              <div className="flex lg:hidden bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("edit")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "edit" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"}`}
                >
                  Editar Detalles
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "preview" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"}`}
                >
                  Ver Vista Previa
                </button>
              </div>

              {/* Form Content */}
              <div className={activeTab === "edit" || typeof window !== "undefined" && window.innerWidth >= 1024 ? "space-y-6" : "hidden"}>
                
                {/* 1. Templates selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-indigo-500" /> Elige una Plantilla Temática (Opcional)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DEDICATION_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => applyTemplate(tmpl)}
                        className="p-3 border border-slate-200 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl bg-slate-50 dark:bg-white/[0.01] hover:bg-indigo-50/10 dark:hover:bg-indigo-500/5 text-center transition-all group cursor-pointer"
                      >
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                          {tmpl.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Remitente & Destinatario */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      De Parte De (Remitente) *
                    </label>
                    <input
                      type="text"
                      value={remitente}
                      onChange={e => setRemitente(e.target.value)}
                      placeholder="Ej. Juan Carlos"
                      className="w-full h-11 px-4 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Para (Destinatario) *
                    </label>
                    <input
                      type="text"
                      value={destinatario}
                      onChange={e => setDestinatario(e.target.value)}
                      placeholder="Ej. Sofía"
                      className="w-full h-11 px-4 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* 3. Mensaje */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Escribe tu Dedicatoria *
                    </label>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500">
                      {mensaje.length} / 400 caract.
                    </span>
                  </div>
                  <textarea
                    value={mensaje}
                    onChange={e => setMensaje(e.target.value.slice(0, 400))}
                    placeholder="Escribe aquí un mensaje especial lleno de cariño..."
                    rows={4}
                    className="w-full p-4 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {/* 4. Photo upload */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5 text-indigo-500" /> Sube tus Fotos (Múltiple - Opcional)
                  </label>
                  
                  {/* Image previews row */}
                  {imagenUrls.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {imagenUrls.map((url, index) => (
                        <div key={index} className="relative h-20 w-20 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          <img src={url} alt={`Preview ${index}`} className="object-cover w-full h-full" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded-full transition-all border-none cursor-pointer"
                            title="Quitar foto"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button area */}
                  {imagenUrls.length < 10 && (
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100/50 dark:hover:bg-white/10 cursor-pointer transition-colors p-3 text-center">
                      {uploading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin text-indigo-500 mb-1" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Procesando imágenes...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-indigo-500 mb-1" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Subir una o más fotos</span>
                          <span className="text-[9px] text-slate-400 mt-0.5">Puedes seleccionar varias fotos (PNG, JPG)</span>
                        </>
                      )}
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>

                {/* 4.5 Presentation Style Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Estilo de Presentación de las Fotos
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setVisualizerType("stack")}
                      className={`py-2 text-[10px] font-bold rounded-xl transition-all ${
                        visualizerType === "stack"
                          ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-slate-500 dark:text-slate-450 hover:text-slate-900"
                      }`}
                    >
                      🖼️ Mazo (Stack)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisualizerType("universe")}
                      className={`py-2 text-[10px] font-bold rounded-xl transition-all ${
                        visualizerType === "universe"
                          ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-slate-500 dark:text-slate-450 hover:text-slate-900"
                      }`}
                    >
                      🌌 Universo
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisualizerType("hanging")}
                      className={`py-2 text-[10px] font-bold rounded-xl transition-all ${
                        visualizerType === "hanging"
                          ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-slate-500 dark:text-slate-450 hover:text-slate-900"
                      }`}
                    >
                      🧺 Colgadas
                    </button>
                  </div>
                </div>

                {/* 5. Audio Settings Tab Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Music className="h-3.5 w-3.5 text-indigo-500" /> Elige la Música / Audio (Opcional)
                  </label>
                  <div className="flex border-b border-slate-200 dark:border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setAudioType("spotify")}
                      className={`flex-1 pb-2 font-bold border-b-2 text-center transition-all ${
                        audioType === "spotify"
                          ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                          : "border-transparent text-slate-400 hover:text-slate-650"
                      }`}
                    >
                      🎵 Spotify
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudioType("youtube")}
                      className={`flex-1 pb-2 font-bold border-b-2 text-center transition-all ${
                        audioType === "youtube"
                          ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                          : "border-transparent text-slate-400 hover:text-slate-650"
                      }`}
                    >
                      📹 YouTube
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudioType("upload")}
                      className={`flex-1 pb-2 font-bold border-b-2 text-center transition-all ${
                        audioType === "upload"
                          ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                          : "border-transparent text-slate-400 hover:text-slate-650"
                      }`}
                    >
                      🎙️ Subir MP3 / Voz
                    </button>
                  </div>

                  {/* Conditional inputs */}
                  {audioType === "spotify" && (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={spotifyInput}
                        onChange={e => setSpotifyInput(e.target.value)}
                        placeholder="Pega el enlace de Spotify: https://open.spotify.com/track/..."
                        className="w-full h-11 px-4 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-440 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <p className="text-[10px] text-slate-400">Se reproduce un adelanto de 30 segundos usando el reproductor de cristal.</p>
                    </div>
                  )}

                  {audioType === "youtube" && (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={youtubeInput}
                        onChange={e => setYoutubeInput(e.target.value)}
                        placeholder="Pega el enlace de YouTube: https://www.youtube.com/watch?v=..."
                        className="w-full h-11 px-4 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-440 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <p className="text-[10px] text-slate-400">El destinatario podrá reproducir el video completo en un reproductor de YouTube.</p>
                    </div>
                  )}

                  {audioType === "upload" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center justify-center gap-2 h-10 px-4 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors">
                          <Upload className="h-4 w-4" /> Seleccionar Archivo
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setAudioFile(file);
                                setAudioUrl(URL.createObjectURL(file));
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        {audioFile && (
                          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold truncate max-w-xs">
                            🎙️ {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </div>
                        )}
                      </div>
                      {audioUrl && (
                        <div className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                          <audio src={audioUrl} controls className="w-full h-8" />
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400">Graba una nota de voz o sube una canción en MP3/M4A (Límite 10MB).</p>
                    </div>
                  )}
                </div>

                {/* 6. Pattern Configurator */}
                <div className="border-t border-slate-100 dark:border-white/5 pt-6 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <RefreshCw className="h-4 w-4 text-indigo-500 animate-spin-slow" /> Generador del Patrón de Fondo
                  </h3>

                  {/* Icon Select */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Icono del Fondo Repetitivo
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {patternIcons.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setPatronKey(item.key)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-semibold transition-all cursor-pointer ${patronKey === item.key ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "border-slate-200 dark:border-white/10 hover:border-slate-400 bg-slate-50 dark:bg-white/[0.01] text-slate-600 dark:text-slate-350"}`}
                        >
                          <span className={patronKey === item.key ? "text-white" : "text-indigo-600 dark:text-indigo-400"}>
                            {getCategoryIconByKey(item.key, { size: 13 })}
                          </span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Preset Select */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Color de Fondo
                    </label>
                    <div className="flex gap-2">
                      {bgPresets.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => setBgColor(preset.value)}
                          style={{ backgroundColor: preset.value }}
                          className={`w-9 h-9 rounded-full border shadow-inner transition-all flex items-center justify-center cursor-pointer ${bgColor === preset.value ? "border-indigo-600 scale-110 ring-2 ring-indigo-500/20" : "border-slate-250 dark:border-white/20 hover:scale-105"}`}
                          title={preset.label}
                        >
                          {bgColor === preset.value && (
                            <Check className={`h-4.5 w-4.5 ${preset.value === "#1e1e24" ? "text-white" : "text-indigo-600"}`} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-extrabold rounded-2xl shadow-xl shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-4"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Guardando tu Experiencia...
                    </>
                  ) : (
                    <>
                      Crear Dedicatoria Digital <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

              </div>
            </div>

            {/* Right Column: Live Mobile Preview */}
            <div className={`lg:col-span-5 ${activeTab === "preview" || typeof window !== "undefined" && window.innerWidth >= 1024 ? "block" : "hidden lg:block"}`}>
              <div className="sticky top-28 bg-slate-950 p-3 rounded-[40px] border-[6px] border-slate-900 shadow-2xl overflow-hidden aspect-[9/18.5] max-w-[340px] mx-auto">
                
                {/* Simulated Notch / Dynamic Island */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-center text-[10px] text-white/50 font-bold select-none">
                  10:09
                </div>

                {/* Background Wrapper */}
                <div 
                  className={`w-full h-full rounded-[30px] relative overflow-hidden select-none bg-gradient-to-b ${getBgGradient(bgColor)}`}
                >
                  
                  {/* Pattern Tiled Backdrop */}
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-6 gap-x-2 gap-y-6 p-2 overflow-hidden">
                    {Array.from({ length: 60 }).map((_, i) => {
                      const iconKey = patronKey === "cats-hearts" 
                        ? (i % 2 === 0 ? "cat" : "heart") 
                        : patronKey;
                      return (
                        <div 
                          key={i} 
                          className={`flex items-center justify-center ${
                            bgColor === "#1e1e24" ? "text-white/15" : "text-indigo-950/15"
                          }`}
                        >
                          {getCategoryIconByKey(iconKey, { size: 14 })}
                        </div>
                      );
                    })}
                  </div>

                  {/* Scrollable Content Container */}
                  <div className="absolute inset-0 overflow-y-auto pt-14 pb-6 px-8 scrollbar-none z-10 flex flex-col gap-4">
                    
                    {/* Top Header Card (Glassmorphism Bubble) */}
                    <div className={`backdrop-blur-xl border rounded-2xl p-3 shadow-md w-full flex items-center justify-between ${
                      isDarkBg 
                        ? "bg-white/20 border-white/30 text-white" 
                        : "bg-indigo-950/5 border-indigo-950/10 text-indigo-950"
                    }`}>
                      <button className={`p-1 cursor-not-allowed ${isDarkBg ? "text-white/80" : "text-indigo-950/80"}`}>
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <div className="flex-1 text-center px-2">
                        <h2 className={`text-xs font-extrabold tracking-tight drop-shadow-sm leading-tight flex items-center justify-center gap-1 ${
                          isDarkBg ? "text-white" : "text-indigo-950"
                        }`}>
                          ¡Para {destinatario || "Alguien Especial"}! <Sparkles className="h-3 w-3 fill-current animate-pulse opacity-80" />
                        </h2>
                        <p className={`text-[9px] font-medium mt-0.5 ${isDarkBg ? "text-white/90" : "text-indigo-900/70"}`}>
                          De parte de: <span className="font-extrabold">{remitente || "Remitente"}</span>
                        </p>
                      </div>
                      <button className={`p-1 cursor-not-allowed ${isDarkBg ? "text-white/80" : "text-indigo-950/80"}`}>
                        <Share2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Photo Stack Gallery */}
                    {imagenUrls.length > 0 ? (
                      <div className="w-full overflow-visible">
                        <StackedPhotos imageUrls={imagenUrls} mode={visualizerType} />
                      </div>
                    ) : (
                      /* Suspended 3D Product Float Simulator */
                      <div className="relative h-40 w-full flex flex-col items-center justify-center overflow-visible py-2">
                        {/* Perspective Glowing Glass Disc Plate */}
                        <div className={`absolute bottom-3 w-32 h-6 rounded-full border shadow-md blur-[1px] transform scale-y-[0.35] z-0 animate-pulse ${
                          isDarkBg ? "bg-white/25 border-white/30" : "bg-indigo-950/10 border-indigo-950/20"
                        }`} />
                        <div className="absolute bottom-2 w-24 h-5 bg-black/10 rounded-full blur-sm z-0" />
                        <div className={`relative z-10 w-20 h-20 flex items-center justify-center rounded-full shadow-lg border animate-bounce-slow ${
                          isDarkBg ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 border-white/30" : "bg-gradient-to-br from-indigo-600 to-violet-600 border-indigo-950/10"
                        }`}>
                          <Gift className="w-10 h-10 text-white drop-shadow-md" />
                        </div>
                      </div>
                    )}

                    {/* Bottom Card: Message & Spotify Music Player */}
                    <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/30 dark:border-white/10 rounded-2xl p-4 shadow-lg w-full space-y-3">
                      <p className="text-xs font-semibold text-purple-950 dark:text-purple-100 leading-relaxed text-center italic font-serif px-1 relative">
                        <span className="text-sm font-bold text-fuchsia-400 opacity-60 absolute -top-1 left-0">“</span>
                        {mensaje || "Feliz Aniversario mi vida, gracias por cada momento juntos. ❤️"}
                        <span className="text-sm font-bold text-fuchsia-400 opacity-60 absolute -bottom-2 right-0">”</span>
                      </p>

                      {/* Spotify Player Embed */}
                      {spotifyUri && (
                        <div className="pt-2 border-t border-purple-100/50 dark:border-white/5">
                          <SpotifyPlayerPremium spotifyUri={spotifyUri} />
                        </div>
                      )}
                    </div>

                    {/* Conversion Banner Hook */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-4 text-center text-white shadow-xl shadow-indigo-600/10 w-full">
                      <p className="text-[10px] font-extrabold tracking-wider uppercase mb-1">¿Te encantó tu detalle?</p>
                      <p className="text-[10px] opacity-90 leading-tight mb-2">
                        Tú también puedes diseñar un regalo 3D personalizado con dedicatoria interactiva gratis en Smartist.
                      </p>
                      <div className="inline-block px-3 py-1 bg-white text-indigo-600 text-[10px] font-extrabold rounded-lg shadow-sm">
                        Crear Regalo 3D
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
