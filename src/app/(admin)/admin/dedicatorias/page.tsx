"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Eye, 
  Search, 
  Gift, 
  Calendar, 
  User, 
  Music, 
  Image as ImageIcon,
  Sparkles,
  ArrowLeft,
  Share2,
  RefreshCw as RefreshCwIcon
} from "lucide-react";
import { toast } from "sonner";
import { getCategoryIconByKey } from "@/components/ui/icons";
import { SpotifyPlayerPremium } from "@/components/ui/SpotifyPlayerPremium";
import { StackedPhotos } from "@/components/ui/StackedPhotos";

interface Dedicatoria {
  id: string;
  orderId: string | null;
  remitente: string;
  destinatario: string;
  mensaje: string;
  imagenUrl: string | null;
  spotifyUri: string | null;
  patronKey: string;
  bgColor: string | null;
  vistaContador: number;
  createdAt: string;
  pedido?: {
    id: string;
    total: number;
    estadoId: string;
  } | null;
}

export default function AdminDedicatoriasPage() {
  const [dedicatorias, setDedicatorias] = useState<Dedicatoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Selected Dedication for mobile preview modal
  const [selectedDedication, setSelectedDedication] = useState<Dedicatoria | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    fetchDedicatorias();
  }, []);

  const fetchDedicatorias = async () => {
    try {
      const res = await fetch("/api/dedicatorias");
      if (res.ok) {
        const data = await res.json();
        setDedicatorias(data);
      } else {
        toast.error("Error al obtener la lista de dedicatorias.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al cargar dedicatorias.");
    } finally {
      setLoading(false);
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

  const filtered = dedicatorias.filter((d) => {
    const term = searchTerm.toLowerCase();
    return (
      d.remitente.toLowerCase().includes(term) ||
      d.destinatario.toLowerCase().includes(term) ||
      d.mensaje.toLowerCase().includes(term) ||
      d.id.toLowerCase().includes(term) ||
      (d.orderId && d.orderId.toLowerCase().includes(term))
    );
  });

  const openPreview = (dedication: Dedicatoria) => {
    setSelectedDedication(dedication);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Gift className="h-7 w-7 text-indigo-500" />
            Gestión de Dedicatorias
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervisa las dedicatorias creadas por tus clientes y revisa la métrica de interacción en la web.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por cliente, mensaje, pedido..."
            className="pl-9 h-10 bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-200 dark:border-white/10 text-sm shadow-sm rounded-full text-slate-900 dark:text-white focus-visible:ring-indigo-500 transition-all placeholder:text-slate-450"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table grid */}
      <Card className="border border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-white/[0.02]">
              <TableRow className="border-slate-200 dark:border-white/10">
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">ID / Fecha</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Remitente</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Destinatario</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400 text-center">Vistas 👀</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Pedido Asociado</TableHead>
                <TableHead className="w-20 font-bold text-slate-500 dark:text-slate-400"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx} className="border-slate-100 dark:border-white/5">
                    <TableCell><div className="h-4 w-24 bg-slate-250 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-28 bg-slate-250 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-28 bg-slate-250 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell className="text-center"><div className="h-4 w-8 bg-slate-250 dark:bg-white/5 rounded mx-auto animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-20 bg-slate-250 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-8 w-8 bg-slate-250 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((ded) => (
                  <TableRow key={ded.id} className="border-slate-100 dark:border-white/5 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                      <div className="font-mono font-semibold text-slate-700 dark:text-slate-350">
                        #{ded.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div className="text-[10px] opacity-75 mt-0.5">
                        {new Date(ded.createdAt).toLocaleDateString("es-PE")}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">{ded.remitente}</TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">{ded.destinatario}</TableCell>
                    <TableCell className="text-center font-bold text-slate-750 dark:text-slate-300">
                      {ded.vistaContador}
                    </TableCell>
                    <TableCell className="text-xs">
                      {ded.pedido ? (
                        <div className="space-y-0.5">
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                            #{ded.pedido.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="block text-[10px] text-slate-450 dark:text-slate-500">
                            Total: S/. {Number(ded.pedido.total).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Gratuito / No compra</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openPreview(ded)}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 dark:bg-white/[0.02] h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-slate-500 dark:text-slate-400 text-sm">
                    No se encontraron dedicatorias registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Embedded Floating Glassmorphism Live Mobile Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-sm bg-slate-950 p-0 overflow-hidden rounded-[40px] border-none shadow-2xl flex flex-col items-center justify-center">
          {selectedDedication && (() => {
            const [actualPatronKey, visualizerType] = (selectedDedication.patronKey || "corazones").split(":");
            const imageUrls = selectedDedication.imagenUrl ? selectedDedication.imagenUrl.split(",") : [];
            return (
              <div className="relative w-full h-[600px] bg-slate-950 rounded-[40px] overflow-hidden p-2 flex items-center justify-center">
                
                {/* iPhone Notch Simulator */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-center text-[10px] text-white/50 font-bold select-none">
                  10:09
                </div>

                {/* Simulated Screen */}
                <div className={`w-full h-full rounded-[32px] relative overflow-hidden select-none bg-gradient-to-b ${getBgGradient(selectedDedication.bgColor)}`}>
                  
                  {/* Pattern Tiled Backdrop */}
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-6 gap-x-2 gap-y-6 p-2 overflow-hidden">
                    {Array.from({ length: 60 }).map((_, i) => {
                      const iconKey = actualPatronKey === "cats-hearts" 
                        ? (i % 2 === 0 ? "cat" : "heart") 
                        : actualPatronKey;
                      return (
                        <div 
                          key={i} 
                          className={`flex items-center justify-center ${
                            selectedDedication.bgColor === "#1e1e24" ? "text-white/15" : "text-indigo-950/15"
                          }`}
                        >
                          {getCategoryIconByKey(iconKey, { size: 14 })}
                        </div>
                      );
                    })}
                  </div>

                {/* Scrollable Content Container */}
                <div className="absolute inset-0 overflow-y-auto pt-14 pb-6 px-6 scrollbar-none z-10 flex flex-col gap-4">
                  
                  {/* Top Header Card (Glassmorphism Bubble) */}
                  <div className={`backdrop-blur-xl border rounded-2xl p-3 shadow-md w-full flex items-center justify-between ${
                    selectedDedication.bgColor === "#1e1e24" 
                      ? "bg-white/20 border-white/30 text-white" 
                      : "bg-indigo-950/5 border-indigo-950/10 text-indigo-950"
                  }`}>
                    <button className="opacity-80 p-1 cursor-not-allowed">
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex-1 text-center px-2">
                      <h2 className="text-xs font-extrabold tracking-tight drop-shadow-sm leading-tight flex items-center justify-center gap-1">
                        ¡Para {selectedDedication.destinatario}! <Sparkles className="h-3 w-3 fill-current animate-pulse opacity-85" />
                      </h2>
                      <p className="text-[9px] font-medium mt-0.5 opacity-90">
                        De parte de: <span className="font-extrabold">{selectedDedication.remitente}</span>
                      </p>
                    </div>
                    <button className="opacity-80 p-1 cursor-not-allowed">
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Photo Stack Gallery */}
                  {imageUrls.length > 0 && (
                    <div className="w-full overflow-visible">
                      <StackedPhotos imageUrls={imageUrls} mode={visualizerType as any} />
                    </div>
                  )}

                  {/* Bottom Card: Message & Music Player */}
                  <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/30 dark:border-white/10 rounded-2xl p-4 shadow-lg w-full space-y-3">
                    <p className="text-xs font-semibold text-purple-950 dark:text-purple-100 leading-relaxed text-center italic font-serif px-1 relative">
                      <span className="text-sm font-bold text-fuchsia-400 opacity-60 absolute -top-1 left-0">“</span>
                      {selectedDedication.mensaje}
                      <span className="text-sm font-bold text-fuchsia-400 opacity-60 absolute -bottom-2 right-0">”</span>
                    </p>

                    {/* Audio Player (Spotify / YouTube / MP3) */}
                    {selectedDedication.spotifyUri && (
                      <div className="pt-2 border-t border-purple-100/50 dark:border-white/5 w-full">
                        {selectedDedication.spotifyUri.startsWith("youtube:") ? (
                          <div className="rounded-xl overflow-hidden shadow-lg border border-white/10 aspect-video w-full bg-black">
                            <iframe
                              src={`https://www.youtube.com/embed/${selectedDedication.spotifyUri.substring(8)}?autoplay=1&modestbranding=1&rel=0`}
                              title="YouTube Music Video"
                              className="w-full h-full border-none"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <SpotifyPlayerPremium spotifyUri={selectedDedication.spotifyUri} />
                        )}
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
          );
        })()}
      </DialogContent>
    </Dialog>
    </div>
  );
}
