"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  CheckCircle,
  Activity,
  Mail
} from "lucide-react";
import { toast } from "sonner";

interface OrderStatus {
  id: string;
  nombre: string;
  descripcion: string | null;
  color: string;
  emailTitulo: string | null;
  emailDescripcion: string | null;
  inEstado: boolean;
}

const colorOptions = [
  { value: "amber", label: "Amarillo / Ámbar", bg: "bg-amber-500", text: "text-amber-500" },
  { value: "emerald", label: "Verde / Esmeralda", bg: "bg-emerald-500", text: "text-emerald-500" },
  { value: "indigo", label: "Azul / Índigo", bg: "bg-indigo-500", text: "text-indigo-500" },
  { value: "sky", label: "Celeste / Sky", bg: "bg-sky-500", text: "text-sky-500" },
  { value: "rose", label: "Rojo / Rosa", bg: "bg-rose-500", text: "text-rose-500" },
  { value: "slate", label: "Gris / Pizarra", bg: "bg-slate-500", text: "text-slate-500" },
];

const getStatusBadgeClass = (colorName: string) => {
  switch (colorName) {
    case "amber":
      return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
    case "emerald":
      return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
    case "indigo":
      return "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20";
    case "sky":
      return "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20";
    case "rose":
      return "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
  }
};

export default function AdminOrderStatusesPage() {
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<OrderStatus | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("indigo");
  const [description, setDescription] = useState("");
  const [emailTitle, setEmailTitle] = useState("");
  const [emailDescription, setEmailDescription] = useState("");
  const [inEstado, setInEstado] = useState(true);

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/estados-pedido");
      if (res.ok) {
        const data = await res.json();
        setStatuses(data);
      } else {
        toast.error("Error al obtener estados de pedido.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al cargar estados de pedido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleOpenCreate = () => {
    setEditingStatus(null);
    setCode("");
    setName("");
    setColor("indigo");
    setDescription("");
    setEmailTitle("");
    setEmailDescription("");
    setInEstado(true);
    setIsOpen(true);
  };

  const handleOpenEdit = (status: OrderStatus) => {
    setEditingStatus(status);
    setCode(status.id);
    setName(status.nombre);
    setColor(status.color);
    setDescription(status.descripcion || "");
    setEmailTitle(status.emailTitulo || "");
    setEmailDescription(status.emailDescripcion || "");
    setInEstado(status.inEstado);
    setIsOpen(true);
  };

  const handleToggleActive = async (status: OrderStatus) => {
    const nextState = !status.inEstado;
    const toastId = toast.loading(`${nextState ? "Activando" : "Desactivando"} estado de pedido...`);
    try {
      const res = await fetch(`/api/admin/estados-pedido/${status.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inEstado: nextState })
      });
      if (res.ok) {
        toast.success(`Estado de pedido ${nextState ? "activado" : "desactivado"} con éxito.`, { id: toastId });
        fetchStatuses();
      } else {
        toast.error("Error al actualizar estado.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión.", { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar o desactivar este estado de pedido?")) return;
    const toastId = toast.loading("Procesando...");
    try {
      const res = await fetch(`/api/admin/estados-pedido/${id}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        if (data.deactivated) {
          toast.success("El estado de pedido tiene pedidos asociados. Se desactivó lógicamente.", { id: toastId });
        } else {
          toast.success("Estado de pedido eliminado con éxito.", { id: toastId });
        }
        fetchStatuses();
      } else {
        toast.error("Error al procesar la solicitud.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión.", { id: toastId });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !color.trim()) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Guardando estado de pedido...");

    const payload = {
      id: code,
      nombre: name,
      color,
      descripcion: description || null,
      emailTitulo: emailTitle || null,
      emailDescripcion: emailDescription || null,
      inEstado
    };

    try {
      const url = editingStatus ? `/api/admin/estados-pedido/${editingStatus.id}` : "/api/admin/estados-pedido";
      const method = editingStatus ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(editingStatus ? "Estado de pedido actualizado." : "Estado de pedido registrado.", { id: toastId });
        setIsOpen(false);
        fetchStatuses();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al guardar el estado de pedido.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de red al guardar.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-900 dark:text-white mb-1">
            Estados de Pedido
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Administra los estados de seguimiento de los pedidos y los correos que se envían automáticamente al cambiar de estado.
          </p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 h-10 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Nuevo Estado de Pedido
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-white/[0.02]">
              <TableRow className="border-slate-200 dark:border-white/10">
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Código ID</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Nombre</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Color Visual</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Descripción</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">E-mail Notificación</TableHead>
                <TableHead className="text-center font-bold text-slate-500 dark:text-slate-400">Estado</TableHead>
                <TableHead className="w-24 text-right pr-6 font-bold text-slate-500 dark:text-slate-400">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <TableRow key={idx} className="border-slate-100 dark:border-white/5">
                    <TableCell><div className="h-4 w-20 bg-slate-200 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-32 bg-slate-200 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-6 w-20 bg-slate-200 dark:bg-white/5 rounded-full animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-48 bg-slate-200 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-36 bg-slate-200 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-6 w-20 bg-slate-200 dark:bg-white/5 rounded-full mx-auto animate-pulse" /></TableCell>
                    <TableCell><div className="h-8 w-16 bg-slate-200 dark:bg-white/5 rounded-lg ml-auto animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : statuses.length > 0 ? (
                statuses.map((s) => (
                  <TableRow key={s.id} className={`border-slate-100 dark:border-white/5 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.02] ${!s.inEstado ? "opacity-60" : ""}`}>
                    <TableCell className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">{s.id}</TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-white">{s.nombre}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(s.color)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${colorOptions.find(o => o.value === s.color)?.bg || "bg-indigo-500"}`} />
                        {colorOptions.find(o => o.value === s.color)?.label.split(" / ")[0] || s.color}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-550 dark:text-slate-400 max-w-[200px] truncate">{s.descripcion || "Sin descripción"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs">
                        {s.emailTitulo ? (
                          <span className="font-medium flex items-center gap-1 text-slate-800 dark:text-slate-200">
                            <Mail className="h-3 w-3 text-indigo-500" />
                            {s.emailTitulo}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Sin plantilla de e-mail</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <button 
                        onClick={() => handleToggleActive(s)}
                        className="hover:scale-105 transition-transform"
                      >
                        {s.inEstado ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Inactivo
                          </span>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1.5">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenEdit(s)}
                          className="hover:text-indigo-600 hover:bg-slate-50 dark:bg-white/[0.02] dark:hover:bg-zinc-800 h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(s.id)}
                          className="hover:text-red-500 hover:bg-slate-50 dark:bg-white/[0.02] dark:hover:bg-zinc-800 h-8 w-8 text-slate-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 text-slate-500 dark:text-slate-400 text-sm">
                    No se encontraron estados de pedido registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Creation/Edit Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-2xl p-6 rounded-2xl overflow-hidden flex flex-col">
          <DialogHeader className="pb-2 border-b border-slate-100 dark:border-white/5">
            <DialogTitle className="font-heading font-bold text-xl text-slate-900 dark:text-white">
              {editingStatus ? `Editar: ${editingStatus.nombre}` : "Registrar Estado de Pedido"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Configura los estados del pedido, sus colores en el panel y el e-mail automático que recibirá el usuario.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-4 text-sm max-h-[75vh] overflow-y-auto px-1">
            
            {/* ID / Code */}
            <div className="space-y-1.5">
              <Label htmlFor="status-id" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Código Identificador *</Label>
              <Input 
                id="status-id"
                placeholder="Ej. PENDING, CONFIRMED, PREPARING, SHIPPED"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="rounded-xl font-mono uppercase"
                disabled={!!editingStatus}
                required
              />
              <p className="text-[10px] text-slate-450 dark:text-slate-400">Código único en mayúsculas, usado para identificar el estado lógicamente en el backend.</p>
            </div>

            {/* Nombre */}
            <div className="space-y-1.5">
              <Label htmlFor="status-name" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre en Pantalla *</Label>
              <Input 
                id="status-name"
                placeholder="Ej. Pendiente de Pago, En Preparación, Enviado"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl font-medium"
                required
              />
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <Label htmlFor="status-color" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Color Visual *</Label>
              <select
                id="status-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.05] px-3 py-2 text-sm text-slate-900 dark:text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
              >
                {colorOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <Label htmlFor="status-desc" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Descripción del Estado</Label>
              <textarea
                id="status-desc"
                placeholder="Ej. El pedido ha sido registrado pero falta el pago o verificación del mismo."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[60px] w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.05] px-3 py-2 text-sm text-slate-900 dark:text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="border-t border-slate-100 dark:border-white/5 pt-4">
              <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-indigo-500" />
                Plantilla de Notificación por Correo
              </h3>
              
              {/* Email Title */}
              <div className="space-y-1.5 mb-3">
                <Label htmlFor="email-title" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Título del Correo</Label>
                <Input 
                  id="email-title"
                  placeholder="Ej. ¡Tu pedido está en camino! 🚚"
                  value={emailTitle}
                  onChange={(e) => setEmailTitle(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* Email Description */}
              <div className="space-y-1.5">
                <Label htmlFor="email-desc" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cuerpo del Correo</Label>
                <textarea
                  id="email-desc"
                  placeholder="Ej. Buenas noticias, hemos entregado tu pedido al courier. Muy pronto estará en tus manos."
                  value={emailDescription}
                  onChange={(e) => setEmailDescription(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.05] px-3 py-2 text-sm text-slate-900 dark:text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-400">Si dejas estos campos vacíos, no se enviará correo de notificación automática para este estado.</p>
              </div>
            </div>

            {/* Active Toggle Switch */}
            <div className="flex items-center justify-between border border-slate-200 dark:border-white/10 rounded-xl p-3 bg-slate-50 dark:bg-white/[0.02] transition-colors hover:bg-slate-100/50 dark:hover:bg-white/[0.04]">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  Estado Activo
                </span>
                <span className="text-[10px] text-slate-450 dark:text-slate-400">Permitir cambiar pedidos a este estado en el administrador</span>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  checked={inEstado}
                  onChange={(e) => setInEstado(e.target.checked)}
                  className="sr-only peer"
                  id="status-active-toggle"
                />
                <label htmlFor="status-active-toggle" className="w-9 h-5 bg-slate-250 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-305 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 cursor-pointer"></label>
              </div>
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-white/5 mt-4 shrink-0">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-slate-200 dark:border-white/10 h-10 px-5 text-xs font-bold hover:bg-slate-50 select-none"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={saving}
                className="bg-indigo-650 hover:bg-indigo-500 text-white font-bold h-10 px-5 rounded-xl text-xs select-none shadow-sm flex items-center gap-1.5"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Guardar Cambios
              </Button>
            </div>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
