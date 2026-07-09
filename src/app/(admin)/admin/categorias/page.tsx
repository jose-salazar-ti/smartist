"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { getCategoryIconByKey } from "@/components/ui/icons";
import { 
  FolderOpen, 
  FolderPlus, 
  RefreshCw, 
  Trash2, 
  Edit, 
  Upload, 
  Search, 
  Image as ImageIcon,
  Plus,
  Loader2,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface AdminCategory {
  id: number;
  nombre: string;
  slug: string;
  imagen: string | null;
  productCount: number;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
const AVAILABLE_ICONS = [
  { value: "taza", label: "Taza (Mug)" },
  { value: "ropa", label: "Ropa / Textil" },
  { value: "gift", label: "Regalos" },
  { value: "key", label: "Llaveros" },
  { value: "cap", label: "Gorras" },
  { value: "bottle", label: "Tomatodos / Vasos" },
  { value: "laptop", label: "Oficina / Gaming" },
  { value: "heart", label: "Parejas / Amor" },
  { value: "corporativo", label: "Corporativo (Edificio)" },
  { value: "rocket", label: "Emprendedores (Cohete)" },
  { value: "tag", label: "Etiqueta General" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "whatsapp", label: "WhatsApp" }
];

export default function CategoriasPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form State
  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [imagen, setImagen] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Activity States
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [manualSlug, setManualSlug] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categorias");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data);
    } catch {
      toast.error("Error al cargar las categorías.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Sync slug with name if not edited manually
  const handleNombreChange = (val: string) => {
    setNombre(val);
    if (!manualSlug && !editingId) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(slugify(val));
    setManualSlug(true);
  };

  // Upload category image file
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading("Subiendo imagen...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "productos");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setImagen(data.url);
        toast.success("Imagen subida con éxito.", { id: toastId });
      } else {
        toast.error(data.error || "Error al subir la imagen.", { id: toastId });
      }
    } catch {
      toast.error("Error de conexión al subir la imagen.", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  // Reset form
  const handleResetForm = () => {
    setNombre("");
    setSlug("");
    setImagen("");
    setEditingId(null);
    setManualSlug(false);
  };

  // Edit Category Trigger
  const handleStartEdit = (cat: AdminCategory) => {
    setEditingId(cat.id);
    setNombre(cat.nombre);
    setSlug(cat.slug);
    setImagen(cat.imagen || "");
    setManualSlug(true);
  };

  // Submit Create or Edit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error("El nombre de la categoría es obligatorio.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(editingId ? "Actualizando categoría..." : "Creando categoría...");
    const payload = {
      nombre: nombre.trim(),
      slug: slug.trim() || slugify(nombre),
      imagen: imagen || null
    };

    try {
      const url = editingId ? `/api/admin/categorias/${editingId}` : "/api/admin/categorias";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(editingId ? "Categoría actualizada con éxito." : "Categoría creada con éxito.", { id: toastId });
        handleResetForm();
        fetchCategories();
      } else {
        toast.error(data.error || "Ocurrió un error al guardar la categoría.", { id: toastId });
      }
    } catch {
      toast.error("Error de red al guardar la categoría.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Delete Category handler
  const handleDelete = async (id: number) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }

    setDeletingId(id);
    setConfirmDeleteId(null);
    const toastId = toast.loading("Eliminando categoría...");

    try {
      const res = await fetch(`/api/admin/categorias/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Categoría eliminada con éxito.", { id: toastId });
        fetchCategories();
      } else {
        toast.error(data.error || "Error al eliminar la categoría.", { id: toastId });
      }
    } catch {
      toast.error("Error de red al eliminar la categoría.", { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  // Filter categories client-side
  const filteredCategories = categories.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-900 dark:text-white mb-1">
            Gestión de Categorías
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Crea, edita y gestiona las categorías del catálogo de productos y personalizadores.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-4 py-2 rounded-full">
          <FolderOpen className="h-3.5 w-3.5" />
          {categories.length} Categorías
        </div>
      </div>

      {/* ── TWO COLUMN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
        
        {/* ── CREATE/EDIT FORM CARD ── */}
        <Card className="border border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-2xl">
          <CardHeader className="flex flex-row items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <FolderPlus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="font-heading font-bold text-base text-slate-900 dark:text-white">
              {editingId ? "Editar Categoría" : "Nueva Categoría"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Category Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Nombre de Categoría <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => handleNombreChange(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                  placeholder="Ej: Llaveros, Vasos Térmicos"
                  required
                  autoComplete="off"
                />
              </div>

              {/* Category Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Slug (Ruta URL)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => handleSlugChange(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                  placeholder="ej: vasos-termicos"
                  autoComplete="off"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Se usa en la barra de direcciones de la tienda para filtros.
                </p>
              </div>

              {/* Icon Selector / Image URL Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tipo de Icono o Imagen
                </label>
                <select
                  value={imagen.startsWith("http") || imagen.startsWith("/") ? "custom-url" : imagen}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "custom-url") {
                      setImagen("");
                    } else {
                      setImagen(val);
                    }
                  }}
                  className="w-full h-10 px-3 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="">Ninguno (Por Defecto)</option>
                  <option value="custom-url">Subir archivo o URL personalizada</option>
                  {AVAILABLE_ICONS.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload Block (Only shown for custom URLs or empty) */}
              {(imagen.startsWith("http") || imagen.startsWith("/") || imagen === "") && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Imagen de Categoría
                  </label>
                  <div className="flex gap-3 items-center">
                    <div className="relative h-16 w-16 border rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-900 dark:border-white/10 flex-shrink-0 flex items-center justify-center shadow-inner text-indigo-600 dark:text-indigo-400">
                      {imagen ? (
                        <img src={imagen} alt="Preview" className="object-cover w-full h-full" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={imagen}
                          onChange={e => setImagen(e.target.value)}
                          className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-450 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-550 transition-all"
                          placeholder="http://imagen..."
                        />
                        <label className="flex h-9 w-9 items-center justify-center border rounded bg-slate-50 dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 border-slate-200 dark:border-white/10 cursor-pointer text-slate-700 dark:text-slate-200 shrink-0 rounded-lg transition-colors">
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {imagen && (
                          <button
                            type="button"
                            onClick={() => setImagen("")}
                            className="flex h-9 w-9 items-center justify-center border rounded bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-450 shrink-0 rounded-lg transition-colors"
                            title="Quitar imagen"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Show SVG Icon Preview when a preset icon is selected */}
              {imagen !== "" && !imagen.startsWith("http") && !imagen.startsWith("/") && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Vista Previa del Icono
                  </label>
                  <div className="flex gap-3 items-center border border-slate-200 dark:border-white/10 rounded-xl p-3 bg-slate-50 dark:bg-white/[0.02]">
                    <div className="relative h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-inner">
                      {getCategoryIconByKey(imagen, { size: 24 })}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Icono Vectorial SVG</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">Clave: {imagen}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {editingId && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResetForm}
                    className="flex-1 h-11 font-heading font-bold text-sm border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-2 flex-grow h-11 font-heading font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5"
                >
                  {saving ? (
                    <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Guardando...</>
                  ) : editingId ? (
                    "Guardar Cambios"
                  ) : (
                    <><Plus className="h-4 w-4 mr-2" /> Crear Categoría</>
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

        {/* ── CATEGORIES LIST CARD ── */}
        <Card className="border border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <FolderOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="font-heading font-bold text-base text-slate-900 dark:text-white flex-1">
              Categorías en el Sistema
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchCategories}
              disabled={loading}
              className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              title="Actualizar lista"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>
          
          <div className="p-4 border-b border-slate-150 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o slug..."
                className="pl-9 h-10 bg-white dark:bg-slate-900/60 dark:backdrop-blur-md border border-slate-200 dark:border-white/10 text-sm shadow-sm rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(n => (
                  <div key={n} className="flex items-center gap-3 p-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/5 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
                      <div className="h-2.5 w-1/5 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-16 text-slate-400 dark:text-slate-500">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                  <FolderOpen className="h-8 w-8 opacity-50" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    No se encontraron categorías
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Usa el formulario de la izquierda para registrar una categoría.
                  </p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-white/[0.02]">
                  <TableRow className="border-slate-100 dark:border-white/5">
                    <TableHead className="w-16 font-bold text-slate-500 dark:text-slate-400">Imagen</TableHead>
                    <TableHead className="font-bold text-slate-500 dark:text-slate-400">Detalles</TableHead>
                    <TableHead className="text-center font-bold text-slate-500 dark:text-slate-400">Productos</TableHead>
                    <TableHead className="w-24 text-right pr-6 font-bold text-slate-500 dark:text-slate-400">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map(cat => (
                    <TableRow key={cat.id} className="border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                      
                      {/* Category Thumbnail */}
                      <TableCell className="py-3">
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-inner text-indigo-600 dark:text-indigo-400">
                          {cat.imagen ? (
                            cat.imagen.startsWith("http") || cat.imagen.startsWith("/") ? (
                              <img src={cat.imagen} alt={cat.nombre} className="object-cover w-11 h-11" />
                            ) : (
                              getCategoryIconByKey(cat.imagen, { size: 24 })
                            )
                          ) : (
                            <FolderOpen className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </TableCell>

                      {/* Name & Slug */}
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        <div className="text-sm font-semibold">{cat.nombre}</div>
                        <div className="text-xs text-slate-400 font-normal font-mono select-all">/{cat.slug}</div>
                      </TableCell>

                      {/* Product Count Badge */}
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                          cat.productCount > 0
                            ? "bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20"
                            : "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10"
                        }`}>
                          {cat.productCount} {cat.productCount === 1 ? "producto" : "productos"}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStartEdit(cat)}
                            className="hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-white/5 h-8 w-8"
                            title="Editar categoría"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cat.id)}
                            disabled={deletingId === cat.id}
                            className={`h-8 transition-all ${
                              confirmDeleteId === cat.id
                                ? "w-auto px-3 text-[10px] font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 rounded-lg"
                                : "w-8 text-slate-350 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                            }`}
                            title={confirmDeleteId === cat.id ? "Confirmar eliminación" : "Eliminar categoría"}
                          >
                            {deletingId === cat.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : confirmDeleteId === cat.id ? (
                              "¿Confirmar?"
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
