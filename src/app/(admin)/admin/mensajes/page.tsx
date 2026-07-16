"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building2, 
  Download, 
  User, 
  ExternalLink, 
  MessageSquare, 
  Send, 
  Trash2, 
  Inbox, 
  AlertCircle, 
  CheckCircle2, 
  FolderOpen, 
  Tag, 
  ChevronRight,
  Loader2,
  Clock,
  Sparkles,
  Award
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  nombre: string;
  correo: string | null;
  telefono: string | null;
  asunto: string;
  mensaje: string;
  tipo: string; // "CONTACTO" | "SOPORTE" | "EMPRESA" | "EMPRENDEDOR"
  estado: string; // "PENDIENTE" | "LEIDO" | "RESPONDIDO"
  datosAdicionales: any | null; // razonSocial, producto, cantidad, logoUrl, tienda, ciudad, experiencia
  respuesta: string | null;
  respondidoEn: string | null;
  creadoEn: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filters state
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDIENTE" | "LEIDO" | "RESPONDIDO">("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "CONTACTO" | "SOPORTE" | "EMPRESA" | "EMPRENDEDOR">("ALL");

  const fetchMessages = async (selectIdAfter?: string) => {
    try {
      const res = await fetch("/api/admin/mensajes");
      if (res.ok) {
        const data = (await res.json()) as Message[];
        setMessages(data);
        
        if (selectIdAfter) {
          const found = data.find(m => m.id === selectIdAfter);
          if (found) setSelectedMessage(found);
        } else if (selectedMessage) {
          // Sync currently selected message details
          const found = data.find(m => m.id === selectedMessage.id);
          if (found) setSelectedMessage(found);
        }
      } else {
        toast.error("Error al cargar mensajes.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al cargar mensajes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSelectMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    setReplyText("");
    
    // Mark as Read automatically if it is in PENDING status
    if (msg.estado === "PENDIENTE") {
      try {
        const res = await fetch(`/api/admin/mensajes/${msg.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "LEIDO" })
        });
        if (res.ok) {
          // Fetch silently to refresh list state without reset loading spinner
          const listRes = await fetch("/api/admin/mensajes");
          if (listRes.ok) {
            const data = await listRes.json();
            setMessages(data);
            // Refresh detail state
            const updatedMsg = data.find((m: Message) => m.id === msg.id);
            if (updatedMsg) setSelectedMessage(updatedMsg);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;
    if (!replyText.trim()) {
      toast.error("Por favor escribe una respuesta.");
      return;
    }

    setSendingReply(true);
    const toastId = toast.loading("Enviando respuesta...");

    try {
      const res = await fetch(`/api/admin/mensajes/${selectedMessage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respuesta: replyText })
      });

      if (res.ok) {
        toast.success("Respuesta enviada y registrada con éxito.", { id: toastId });
        setReplyText("");
        await fetchMessages(selectedMessage.id);
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al enviar la respuesta.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al responder.", { id: toastId });
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este mensaje permanentemente?")) return;
    
    const toastId = toast.loading("Eliminando mensaje...");
    try {
      const res = await fetch(`/api/admin/mensajes/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Mensaje eliminado con éxito.", { id: toastId });
        setSelectedMessage(null);
        fetchMessages();
      } else {
        toast.error("Error al eliminar el mensaje.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al eliminar.", { id: toastId });
    }
  };

  // Filter messages logic
  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = 
      msg.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.correo && msg.correo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      msg.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.mensaje.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || msg.estado === statusFilter;
    const matchesType = typeFilter === "ALL" || msg.tipo === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Count items for folders
  const getCountByStatus = (status: "PENDIENTE" | "LEIDO" | "RESPONDIDO") => {
    return messages.filter(m => m.estado === status).length;
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "EMPRESA":
        return "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20";
      case "EMPRENDEDOR":
        return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      case "SOPORTE":
        return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      default: // CONTACTO
        return "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDIENTE":
        return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      case "LEIDO":
        return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10";
      case "RESPONDIDO":
        return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      default:
        return "";
    }
  };

  const translateType = (type: string) => {
    switch (type) {
      case "EMPRESA": return "Cotización B2B";
      case "EMPRENDEDOR": return "Emprendedor";
      case "SOPORTE": return "Soporte";
      default: return "Contacto";
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "PENDIENTE": return "Pendiente";
      case "LEIDO": return "Leído";
      case "RESPONDIDO": return "Respondido";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-3xl text-slate-900 dark:text-white mb-1">
          Bandeja de Mensajes
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Gestiona las consultas públicas, solicitudes de cotizaciones de empresas y aplicaciones de emprendedores dropshipping.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* SIDE BAR FILTERS - (Col 1-3) */}
        <div className="xl:col-span-3 space-y-4">
          
          {/* Folders Card */}
          <Card className="border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-2xl shadow-xl">
            <CardContent className="p-4 space-y-1">
              <div className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest px-3 mb-2 flex items-center gap-1.5">
                <FolderOpen className="h-3 w-3" /> Carpetas de Estado
              </div>
              <button 
                onClick={() => setStatusFilter("ALL")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === "ALL" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"}`}
              >
                <span className="flex items-center gap-2">📥 Todos los mensajes</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${statusFilter === "ALL" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>{messages.length}</span>
              </button>
              
              <button 
                onClick={() => setStatusFilter("PENDIENTE")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === "PENDIENTE" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"}`}
              >
                <span className="flex items-center gap-2">⏳ Pendientes</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${statusFilter === "PENDIENTE" ? "bg-white/20 text-white" : "bg-amber-500/10 text-amber-500"}`}>{getCountByStatus("PENDIENTE")}</span>
              </button>

              <button 
                onClick={() => setStatusFilter("LEIDO")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === "LEIDO" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"}`}
              >
                <span className="flex items-center gap-2">👀 Leídos</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${statusFilter === "LEIDO" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>{getCountByStatus("LEIDO")}</span>
              </button>

              <button 
                onClick={() => setStatusFilter("RESPONDIDO")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === "RESPONDIDO" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"}`}
              >
                <span className="flex items-center gap-2">✅ Respondidos</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${statusFilter === "RESPONDIDO" ? "bg-white/20 text-white" : "bg-emerald-500/10 text-emerald-400"}`}>{getCountByStatus("RESPONDIDO")}</span>
              </button>
            </CardContent>
          </Card>

          {/* Channels Card */}
          <Card className="border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-2xl shadow-xl">
            <CardContent className="p-4 space-y-1">
              <div className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest px-3 mb-2 flex items-center gap-1.5">
                <Tag className="h-3 w-3" /> Canales de Origen
              </div>
              
              <button 
                onClick={() => setTypeFilter("ALL")}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${typeFilter === "ALL" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/15" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"}`}
              >
                <span>🌐 Todos los canales</span>
              </button>

              <button 
                onClick={() => setTypeFilter("CONTACTO")}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${typeFilter === "CONTACTO" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/15" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"}`}
              >
                <span>📬 Formulario Contacto</span>
                <span className="text-[10px] text-slate-400">{messages.filter(m => m.tipo === "CONTACTO").length}</span>
              </button>

              <button 
                onClick={() => setTypeFilter("SOPORTE")}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${typeFilter === "SOPORTE" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/15" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"}`}
              >
                <span>🛠️ Ayuda / Soporte</span>
                <span className="text-[10px] text-slate-400">{messages.filter(m => m.tipo === "SOPORTE").length}</span>
              </button>

              <button 
                onClick={() => setTypeFilter("EMPRESA")}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${typeFilter === "EMPRESA" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/15" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"}`}
              >
                <span>🏢 Cotización Empresas B2B</span>
                <span className="text-[10px] text-slate-400">{messages.filter(m => m.tipo === "EMPRESA").length}</span>
              </button>

              <button 
                onClick={() => setTypeFilter("EMPRENDEDOR")}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${typeFilter === "EMPRENDEDOR" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/15" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"}`}
              >
                <span>🚀 Programa Emprendedor</span>
                <span className="text-[10px] text-slate-400">{messages.filter(m => m.tipo === "EMPRENDEDOR").length}</span>
              </button>
            </CardContent>
          </Card>

        </div>

        {/* MESSAGES LIST & SPLIT INBOX VIEW - (Col 4-12) */}
        <div className="xl:col-span-9 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* INBOX LIST CARD - (Col 1-5 of inbox area) */}
          <Card className="md:col-span-5 border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-2xl shadow-xl flex flex-col h-[70vh] overflow-hidden">
            
            {/* Search header */}
            <div className="p-4 border-b border-slate-100 dark:border-white/5 shrink-0 relative">
              <Search className="absolute left-7 top-7 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar remitente, asunto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 rounded-xl text-xs bg-slate-50 dark:bg-white/2"
              />
            </div>

            {/* Scrollable list content */}
            <div className="grow overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-28 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
                      <div className="h-4 w-12 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-40 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
                    <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                  </div>
                ))
              ) : filteredMessages.length > 0 ? (
                filteredMessages.map((m) => (
                  <div 
                    key={m.id}
                    onClick={() => handleSelectMessage(m)}
                    className={`p-4 transition-all duration-200 cursor-pointer flex flex-col gap-2 relative ${selectedMessage?.id === m.id ? "bg-indigo-50/40 dark:bg-indigo-950/10 border-l-4 border-indigo-600" : "hover:bg-slate-50/50 dark:hover:bg-white/[0.01]"} ${m.estado === "PENDIENTE" ? "font-semibold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}
                  >
                    
                    {/* Badge type and date */}
                    <div className="flex justify-between items-center gap-2">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${getTypeBadgeClass(m.tipo)}`}>
                        {translateType(m.tipo)}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(m.creadoEn).toLocaleDateString("es-PE", { day: '2-digit', month: 'short' })}
                      </span>
                    </div>

                    {/* Sender and Subject */}
                    <div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        {m.nombre}
                        {m.estado === "PENDIENTE" && (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-slate-700 dark:text-slate-350 truncate font-semibold mt-0.5">{m.asunto}</div>
                    </div>

                    {/* Short preview */}
                    <p className="text-[11px] text-slate-450 dark:text-slate-450 line-clamp-2 leading-relaxed">
                      {m.mensaje}
                    </p>

                    {/* Reply tag if responded */}
                    {m.estado === "RESPONDIDO" && (
                      <span className="self-start inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        <CheckCircle2 className="h-3 w-3" /> Contestada
                      </span>
                    )}

                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  No se encontraron mensajes en esta vista.
                </div>
              )}
            </div>
          </Card>

          {/* DETAILED MESSAGE DRAWER - (Col 6-12 of inbox area) */}
          <Card className="md:col-span-7 border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-2xl shadow-xl h-[70vh] overflow-hidden flex flex-col">
            {selectedMessage ? (
              <div className="h-full flex flex-col">
                
                {/* Detail Header */}
                <div className="p-6 border-b border-slate-100 dark:border-white/5 shrink-0 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/20">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${getTypeBadgeClass(selectedMessage.tipo)}`}>
                        {translateType(selectedMessage.tipo)}
                      </span>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${getStatusBadgeClass(selectedMessage.estado)}`}>
                        {translateStatus(selectedMessage.estado)}
                      </span>
                    </div>
                    <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white leading-tight">
                      {selectedMessage.asunto}
                    </h2>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-indigo-400" />
                      De: <strong>{selectedMessage.nombre}</strong>
                      <span className="text-slate-300 dark:text-white/10">|</span>
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(selectedMessage.creadoEn).toLocaleString("es-PE", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  {/* Delete button */}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl h-9 w-9"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </Button>
                </div>

                {/* Scrollable details and body */}
                <div className="grow overflow-y-auto p-6 space-y-6">
                  
                  {/* Metadata and Contact Methods Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-100 dark:border-white/5 rounded-xl p-4 bg-slate-50/50 dark:bg-white/1">
                    
                    {/* Mail Link */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1"><Mail className="h-3 w-3" /> Correo</span>
                      {selectedMessage.correo ? (
                        <a 
                          href={`mailto:${selectedMessage.correo}`}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          {selectedMessage.correo}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-rose-500 font-semibold flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" /> Sin e-mail registrado
                        </span>
                      )}
                    </div>

                    {/* WhatsApp Quick chat Link */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1"><Phone className="h-3 w-3" /> Teléfono / WhatsApp</span>
                      {selectedMessage.telefono ? (
                        <a 
                          href={`https://wa.me/${selectedMessage.telefono.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(selectedMessage.nombre)},%20te%20escribimos%20de%20Smartist%20respecto%20a%20tu%20consulta%20de%20soporte...`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          💬 Chatear: {selectedMessage.telefono}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No registrado</span>
                      )}
                    </div>

                    {/* Corporate-specific B2B fields (EMPRESA) */}
                    {selectedMessage.tipo === "EMPRESA" && selectedMessage.datosAdicionales && (
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 mt-3 border-t border-slate-100 dark:border-white/5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1"><Building2 className="h-3 w-3" /> Razón Social / Empresa</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedMessage.datosAdicionales.razonSocial || "—"}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1"><Download className="h-3 w-3" /> Logo Adjunto</span>
                          {selectedMessage.datosAdicionales.logoUrl ? (
                            <a 
                              href={selectedMessage.datosAdicionales.logoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                              Descargar archivo de logo
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-450 italic">Sin archivo adjunto</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reseller-specific fields (EMPRENDEDOR) */}
                    {selectedMessage.tipo === "EMPRENDEDOR" && selectedMessage.datosAdicionales && (
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 mt-3 border-t border-slate-100 dark:border-white/5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1"><MapPin className="h-3 w-3" /> Ubicación</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedMessage.datosAdicionales.ciudad || "—"}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1"><Building2 className="h-3 w-3" /> Nombre de la Tienda</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedMessage.datosAdicionales.tienda || "Por definir / Dropshipping"}</span>
                        </div>
                        <div className="flex flex-col gap-1 md:col-span-2">
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1"><Award className="h-3 w-3" /> Experiencia</span>
                          <span className="text-xs text-slate-700 dark:text-slate-300">{selectedMessage.datosAdicionales.experiencia || "—"}</span>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Message body text - Chat Left */}
                  <div className="flex flex-col items-start w-full">
                    <div className="max-w-[85%] md:max-w-[70%] space-y-1.5">
                      <div className="flex items-center gap-1.5 px-1">
                        <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                          Consulta / Mensaje (Cliente)
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-white/3 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans shadow-sm">
                        "{selectedMessage.mensaje}"
                      </div>
                    </div>
                  </div>

                  {/* Reply History if already responded - Chat Right */}
                  {selectedMessage.respuesta && (
                    <div className="flex flex-col items-end w-full pt-4 border-t border-slate-100 dark:border-white/5">
                      <div className="max-w-[85%] md:max-w-[70%] space-y-1.5 text-right flex flex-col items-end">
                        <div className="flex items-center gap-1.5 px-1 justify-end w-full">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                            Mi Respuesta (Enviada por E-mail)
                          </span>
                          {selectedMessage.respondidoEn && (
                            <span className="text-[10px] text-slate-400 font-medium ml-2">
                              {new Date(selectedMessage.respondidoEn).toLocaleString("es-PE", {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                          )}
                        </div>
                        <div className="p-4 rounded-2xl rounded-tr-none bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-slate-800 dark:text-slate-200 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans text-left shadow-sm">
                          {selectedMessage.respuesta}
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Bottom Reply Form Area */}
                <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
                  {selectedMessage.correo ? (
                    <form onSubmit={handleSendReply} className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="reply-textarea" className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                          <Send className="h-3.5 w-3.5" /> Redactar Respuesta para {selectedMessage.nombre}
                        </Label>
                        <textarea
                          id="reply-textarea"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Escribe la respuesta. Al enviar, se registrará y se enviará automáticamente un correo a ${selectedMessage.correo}...`}
                          rows={3}
                          disabled={sendingReply}
                          required
                          className="flex min-h-[70px] w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] text-slate-450 dark:text-slate-500">Se usará la plantilla institucional y firma de Smartist Soporte.</p>
                        <Button 
                          type="submit"
                          disabled={sendingReply || !replyText.trim()}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-9 px-4 rounded-xl text-xs flex items-center gap-1.5"
                        >
                          {sendingReply ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          Enviar Correo de Respuesta
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-amber-500/5 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Este cliente no registró correo electrónico
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                          Puedes responderle directamente abriendo un chat de WhatsApp con el botón de arriba. Su número registrado es <strong className="font-mono">{selectedMessage.telefono || "—"}</strong>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500 gap-3">
                <Inbox className="h-12 w-12 text-slate-300 dark:text-white/10" />
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-700 dark:text-slate-300">Bandeja Vacía</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
                    Selecciona una conversación de la lista lateral para visualizar el detalle y redactar una respuesta.
                  </p>
                </div>
              </div>
            )}
          </Card>

        </div>

      </div>

    </div>
  );
}
