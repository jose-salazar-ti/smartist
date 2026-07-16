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
  ToggleLeft, 
  ToggleRight, 
  Loader2, 
  Truck, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface ShippingMethod {
  id: string;
  nombre: string;
  costo: number;
  tiempoEstimado: string | null;
  inEstado: boolean;
}

export default function AdminShippingMethodsPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [cost, setCost] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState("");
  const [inEstado, setInEstado] = useState(true);

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/metodos-envio");
      if (res.ok) {
        const data = await res.json();
        setMethods(data);
      } else {
        toast.error("Error al obtener métodos de envío.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al cargar métodos de envío.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleOpenCreate = () => {
    setEditingMethod(null);
    setCode("");
    setName("");
    setCost(0);
    setEstimatedTime("");
    setInEstado(true);
    setIsOpen(true);
  };

  const handleOpenEdit = (method: ShippingMethod) => {
    setEditingMethod(method);
    setCode(method.id);
    setName(method.nombre);
    setCost(Number(method.costo));
    setEstimatedTime(method.tiempoEstimado || "");
    setInEstado(method.inEstado);
    setIsOpen(true);
  };

  const handleToggleActive = async (method: ShippingMethod) => {
    const nextState = !method.inEstado;
    const toastId = toast.loading(`${nextState ? "Activando" : "Desactivando"} método de envío...`);
    try {
      const res = await fetch(`/api/admin/metodos-envio/${method.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inEstado: nextState })
      });
      if (res.ok) {
        toast.success(`Método de envío ${nextState ? "activado" : "desactivado"} con éxito.`, { id: toastId });
        fetchMethods();
      } else {
        toast.error("Error al actualizar estado.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión.", { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar o desactivar este método de envío?")) return;
    const toastId = toast.loading("Procesando...");
    try {
      const res = await fetch(`/api/admin/metodos-envio/${id}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        if (data.deactivated) {
          toast.success("El método de envío tiene pedidos asociados. Se desactivó lógicamente.", { id: toastId });
        } else {
          toast.success("Método de envío eliminado con éxito.", { id: toastId });
        }
        fetchMethods();
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
    if (!code.trim() || !name.trim() || cost === undefined) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Guardando método de envío...");

    const payload = {
      id: code,
      nombre: name,
      costo: cost,
      tiempoEstimado: estimatedTime || null,
      inEstado
    };

    try {
      const url = editingMethod ? `/api/admin/metodos-envio/${editingMethod.id}` : "/api/admin/metodos-envio";
      const method = editingMethod ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(editingMethod ? "Método de envío actualizado." : "Método de envío registrado.", { id: toastId });
        setIsOpen(false);
        fetchMethods();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al guardar el método de envío.", { id: toastId });
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
            Métodos de Envío
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Administra las opciones de entrega de pedidos en el checkout, como recojo en tienda, envíos a Lima o provincias.
          </p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 h-10 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Nuevo Método de Envío
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-white/2">
              <TableRow className="border-slate-200 dark:border-white/10">
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Código ID</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Nombre</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Costo (S/.)</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Tiempo Estimado</TableHead>
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
                    <TableCell><div className="h-4 w-16 bg-slate-200 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-36 bg-slate-200 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-6 w-20 bg-slate-200 dark:bg-white/5 rounded-full mx-auto animate-pulse" /></TableCell>
                    <TableCell><div className="h-8 w-16 bg-slate-200 dark:bg-white/5 rounded-lg ml-auto animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : methods.length > 0 ? (
                methods.map((m) => (
                  <TableRow key={m.id} className={`border-slate-100 dark:border-white/5 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.02] ${!m.inEstado ? "opacity-60" : ""}`}>
                    <TableCell className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">{m.id}</TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-white">{m.nombre}</TableCell>
                    <TableCell className="font-bold text-sm">S/. {Number(m.costo).toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-slate-550 dark:text-slate-400">{m.tiempoEstimado || "Sin especificar"}</TableCell>
                    <TableCell className="text-center">
                      <button 
                        onClick={() => handleToggleActive(m)}
                        className="hover:scale-105 transition-transform"
                      >
                        {m.inEstado ? (
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
                          onClick={() => handleOpenEdit(m)}
                          className="hover:text-indigo-600 hover:bg-slate-50 dark:bg-white/2 dark:hover:bg-zinc-800 h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(m.id)}
                          className="hover:text-red-500 hover:bg-slate-50 dark:bg-white/2 dark:hover:bg-zinc-800 h-8 w-8 text-slate-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-slate-500 dark:text-slate-400 text-sm">
                    No se encontraron métodos de envío registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Creation/Edit Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-2xl p-6 rounded-2xl overflow-hidden flex flex-col">
          <DialogHeader className="pb-2 border-b border-slate-100 dark:border-white/5">
            <DialogTitle className="font-heading font-bold text-xl text-slate-900 dark:text-white">
              {editingMethod ? `Editar: ${editingMethod.nombre}` : "Registrar Método de Envío"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Configura los costos y plazos de entrega que verán tus clientes durante el pago.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-4 text-sm">
            
            {/* ID / Code */}
            <div className="space-y-1.5">
              <Label htmlFor="shipping-id" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Código Identificador *</Label>
              <Input 
                id="shipping-id"
                placeholder="Ej. RECOJO, LIMA_CENTRO, PROVINCIA_OLVA"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="rounded-xl font-mono uppercase"
                disabled={!!editingMethod}
                required
              />
              <p className="text-[10px] text-slate-400">Código único en mayúsculas, usado internamente en las relaciones de pedidos.</p>
            </div>

            {/* Nombre */}
            <div className="space-y-1.5">
              <Label htmlFor="shipping-name" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre del Método *</Label>
              <Input 
                id="shipping-name"
                placeholder="Ej. Envío Express a Lima, Envío por Agencia Olva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>

            {/* Costo */}
            <div className="space-y-1.5">
              <Label htmlFor="shipping-cost" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Costo de Envío (S/.) *</Label>
              <Input 
                id="shipping-cost"
                type="number"
                step="0.10"
                min="0"
                placeholder="Ej. 10.00 o 0"
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="rounded-xl font-semibold"
                required
              />
            </div>

            {/* Tiempo Estimado */}
            <div className="space-y-1.5">
              <Label htmlFor="shipping-time" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tiempo Estimado de Entrega</Label>
              <Input 
                id="shipping-time"
                placeholder="Ej. 24 a 48 horas, 3 días útiles"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="rounded-xl"
              />
            </div>

            {/* Active Toggle Switch */}
            <div className="flex items-center justify-between border border-slate-200 dark:border-white/10 rounded-xl p-3 bg-slate-50 dark:bg-white/2 transition-colors hover:bg-slate-100/50 dark:hover:bg-white/4">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  Método Activo
                </span>
                <span className="text-[10px] text-slate-450 dark:text-slate-400">Mostrar este método de envío en el checkout público</span>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  checked={inEstado}
                  onChange={(e) => setInEstado(e.target.checked)}
                  className="sr-only peer"
                  id="ship-active-toggle"
                />
                <label htmlFor="ship-active-toggle" className="w-9 h-5 bg-slate-250 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-305 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 cursor-pointer"></label>
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
