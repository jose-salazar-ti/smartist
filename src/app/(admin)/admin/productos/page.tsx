"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Upload, 
  PlusCircle, 
  ToggleLeft, 
  ToggleRight, 
  Loader2, 
  Package, 
  Tags,
  CheckCircle,
  AlertTriangle,
  Settings2,
  Info,
  Settings,
  Layers,
  Palette,
  Eye,
  Star,
  Flame,
  Image as ImageIcon,
  Check
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface DbVariant {
  id?: string;
  title: string;
  sku: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  glbModelUrl?: string | null;
  blankMockupUrl?: string | null;
  maskImageUrl?: string | null;
  printDimensions?: { width: number; height: number } | null;
  mockupConfig?: any | null;
}

interface DbProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  categories?: string[];
  isCustomizable: boolean;
  isActive: boolean;
  destacado?: boolean;
  masVendido?: boolean;
  variants: DbVariant[];
  usuarioId?: string | null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<{ nombre: string; id: number; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "design" | "specs" | "variants">("info");
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Tazas"]);
  const [isCustomizable, setIsCustomizable] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [destacado, setDestacado] = useState(false);
  const [masVendido, setMasVendido] = useState(false);
  const [variants, setVariants] = useState<DbVariant[]>([]);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);

  // Owner selection states
  const [usuarioId, setUsuarioId] = useState<string>("admin");
  const [sellers, setSellers] = useState<{ id: string; email: string; rolId: string; user_metadata?: { name?: string } }[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Deletion states
  const [productToDelete, setProductToDelete] = useState<DbProduct | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeletingProduct(true);
    try {
      const res = await fetch(`/api/products/${productToDelete.id}?permanent=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al eliminar el producto.");
      }

      fetchProducts();
      setProductToDelete(null);
      if (data.deactivated) {
        toast.info(data.message || "El producto ha sido desactivado.");
      } else {
        toast.success(data.message || "Producto eliminado con éxito.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al intentar eliminar el producto.");
    } finally {
      setIsDeletingProduct(false);
    }
  };

  // Load user data & sellers list
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const meRes = await fetch("/api/admin/me");
        const meData = await meRes.json();
        if (meRes.ok && meData.isAdmin) {
          setIsAdmin(true);
          const usersRes = await fetch("/api/admin/usuarios");
          const usersData = await usersRes.json();
          if (usersRes.ok && usersData.users) {
            const sellerUsers = usersData.users.filter(
              (u: any) => u.rolId === "VENDEDOR" || u.rolId === "ADMIN"
            );
            setSellers(sellerUsers);
          }
        }
      } catch (err) {
        console.error("Error loading user roles or sellers:", err);
      }
    };
    loadUserData();
  }, []);

  // New Dynamic Fields State
  const [glbModelUrl, setGlbModelUrl] = useState<string>("");
  const [blankMockupUrl, setBlankMockupUrl] = useState<string>("");
  const [maskImageUrl, setMaskImageUrl] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [printWidth, setPrintWidth] = useState<string>("");
  const [printHeight, setPrintHeight] = useState<string>("");
  const [features, setFeatures] = useState<{label: string, value: string}[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({});
  const pendingFilesRef = useRef<{ [previewUrl: string]: { file: File; type: "models" | "images" | "designs" } }>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void, type: "models" | "images" | "designs", fieldId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Generar vista previa instantánea en memoria (0 latencia, 0 consumo de disco)
    const previewUrl = URL.createObjectURL(file);
    pendingFilesRef.current[previewUrl] = { file, type };
    setter(previewUrl);
    toast.info("Vista previa generada. Se subirá al servidor al hacer clic en 'Guardar Producto'.");
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) {
        setProducts(data);
      } else {
        toast.error("Error al cargar productos.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categorias");
      const data = await res.json();
      if (res.ok) {
        setCategories(data);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setSelectedCategories(categories.length > 0 ? [categories[0].nombre] : ["Tazas"]);
    setIsCustomizable(true);
    setIsActive(true);
    setDestacado(false);
    setMasVendido(false);
    setGlbModelUrl("");
    setBlankMockupUrl("");
    setMaskImageUrl("");
    setGalleryImages([]);
    setPrintWidth("");
    setPrintHeight("");
    setFeatures([]);
    setBenefits([]);
    const randSku = Math.floor(1000 + Math.random() * 9000);
    setVariants([
      { title: "Estándar", sku: `SKU-PROD-${randSku}`, price: 15.0, stock: 50, imageUrl: null, glbModelUrl: null, blankMockupUrl: null, maskImageUrl: null, printDimensions: null, mockupConfig: null }
    ]);
    setUsuarioId("admin");
    setActiveTab("info");
    setIsOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product: DbProduct) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    const prodCats = product.categories && product.categories.length > 0 
      ? product.categories 
      : (product.category ? [product.category] : ["Tazas"]);
    setSelectedCategories(prodCats);
    setIsCustomizable(product.isCustomizable);
    setIsActive(product.isActive);
    setDestacado(product.destacado || false);
    setMasVendido(product.masVendido || false);
    setUsuarioId(product.usuarioId || "admin");
    setGlbModelUrl((product as any).glbModelUrl || "");
    setBlankMockupUrl((product as any).blankMockupUrl || "");
    setMaskImageUrl((product as any).maskImageUrl || "");
    setGalleryImages((product as any).galleryImages || []);
    setPrintWidth((product as any).printDimensions?.width?.toString() || "");
    setPrintHeight((product as any).printDimensions?.height?.toString() || "");
    setFeatures((product as any).features || []);
    setBenefits((product as any).benefits || []);
    setVariants(product.variants.map(v => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      price: Number(v.price),
      stock: v.stock,
      imageUrl: v.imageUrl,
      glbModelUrl: v.glbModelUrl || null,
      blankMockupUrl: v.blankMockupUrl || null,
      maskImageUrl: v.maskImageUrl || null,
      printDimensions: v.printDimensions || null,
      mockupConfig: v.mockupConfig || null
    })));
    setActiveTab("info");
    setIsOpen(true);
  };

  // Toggle Activation directly from Table
  const handleToggleActive = async (product: DbProduct) => {
    const nextActive = !product.isActive;
    const toastId = toast.loading(`${nextActive ? "Activando" : "Desactivando"} producto...`);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          category: product.category,
          isActive: nextActive
        })
      });
      if (res.ok) {
        toast.success(`Producto ${nextActive ? "activado" : "desactivado"} con éxito.`, { id: toastId });
        fetchProducts();
      } else {
        const errData = await res.json();
        const errMsg = errData.error && errData.error.length < 120 ? errData.error : "Error al actualizar el estado del producto.";
        toast.error(errMsg, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de red.", { id: toastId });
    }
  };

  // Helper to upload pending blob URLs to server when clicking Guardar
  const uploadPendingBlobUrls = async (urlsToUpload: (string | null | undefined)[]): Promise<{ [blobUrl: string]: string }> => {
    const blobUrls = Array.from(new Set(urlsToUpload.filter((u): u is string => !!u && u.startsWith("blob:"))));
    const urlMap: { [blobUrl: string]: string } = {};

    if (blobUrls.length === 0) return urlMap;

    for (const blobUrl of blobUrls) {
      const item = pendingFilesRef.current[blobUrl];
      if (item) {
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("type", item.type);

        try {
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (data.url) {
            urlMap[blobUrl] = data.url;
          }
        } catch (err) {
          console.error("Error al subir archivo pendiente:", err);
        }
      }
    }

    return urlMap;
  };

  // Save product (Create or Edit)
  const handleSave = async () => {
    if (!name.trim() || !description.trim() || selectedCategories.length === 0) {
      toast.error("Por favor completa los datos obligatorios y selecciona al menos una categoría.");
      return;
    }

    if (variants.length === 0) {
      toast.error("El producto debe tener al menos una variante.");
      return;
    }

    // Validate variants SKUs and fields
    for (const v of variants) {
      if (!v.title.trim() || !v.sku.trim() || v.price <= 0 || v.stock < 0) {
        toast.error("Por favor completa todos los campos de variantes con valores válidos (precio > 0, stock >= 0).");
        return;
      }
    }

    setSaving(true);
    const toastId = toast.loading("Guardando producto...");

    try {
      const allUrls = [
        glbModelUrl,
        blankMockupUrl,
        maskImageUrl,
        ...galleryImages,
        ...variants.map(v => v.imageUrl),
        ...variants.map(v => v.blankMockupUrl),
        ...variants.map(v => v.maskImageUrl),
        ...variants.map(v => v.glbModelUrl),
      ];

      const blobMap = await uploadPendingBlobUrls(allUrls);
      const resolveUrl = (u: string | null | undefined) => (u && blobMap[u]) ? blobMap[u] : u;

      const finalGalleryImages = galleryImages.map(img => resolveUrl(img)).filter((img): img is string => !!img);
      const finalVariants = variants.map(v => ({
        ...v,
        imageUrl: resolveUrl(v.imageUrl) || null,
        blankMockupUrl: resolveUrl(v.blankMockupUrl) || null,
        maskImageUrl: resolveUrl(v.maskImageUrl) || null,
        glbModelUrl: resolveUrl(v.glbModelUrl) || null,
      }));

      const payload = {
        name,
        description,
        category: selectedCategories[0] || "",
        categories: selectedCategories,
        isCustomizable,
        isActive,
        destacado,
        masVendido,
        glbModelUrl: resolveUrl(glbModelUrl) || null,
        blankMockupUrl: resolveUrl(blankMockupUrl) || null,
        maskImageUrl: resolveUrl(maskImageUrl) || null,
        galleryImages: finalGalleryImages,
        printDimensions: printWidth && printHeight ? { width: parseFloat(printWidth), height: parseFloat(printHeight) } : null,
        features,
        benefits,
        variants: finalVariants,
        usuarioId: isAdmin ? usuarioId : undefined
      };

      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        if (data.merged) {
          toast.warning(data.message || "El SKU de la variante ya pertenecía a otro producto. Se sumó el stock al producto existente.", { id: toastId, duration: 6000 });
        } else {
          toast.success(editingProduct ? "Producto actualizado con éxito." : "Producto creado con éxito.", { id: toastId });
        }
        setIsOpen(false);
        fetchProducts();
      } else {
        const errMsg = data.error && data.error.length < 150 ? data.error : "Ocurrió un error al guardar el producto.";
        toast.error(errMsg, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de red al guardar el producto.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Variants editing helpers
  const handleAddVariant = () => {
    const baseSku = name ? name.slice(0, 3).toUpperCase() : "PROD";
    const rand = Math.floor(Math.random() * 1000);
    setVariants(prev => [
      ...prev,
      {
        title: "",
        sku: `SKU-${baseSku}-${rand}`,
        price: 15.0,
        stock: 50,
        imageUrl: null,
        glbModelUrl: null,
        blankMockupUrl: null,
        maskImageUrl: null,
        printDimensions: null,
        mockupConfig: null
      }
    ]);
  };

  const handleUpdateVariant = (index: number, field: keyof DbVariant, value: any) => {
    setVariants(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      toast.error("El producto debe conservar al menos una variante.");
      return;
    }
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  // Handle Variant Image Upload
  const handleVariantImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    pendingFilesRef.current[previewUrl] = { file, type: "images" };
    handleUpdateVariant(index, "imageUrl", previewUrl);
    toast.info("Vista previa de foto de variante lista.");
  };

  // Filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.variants.some(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "Todos" || 
      (product.categories && product.categories.length > 0
        ? product.categories.includes(categoryFilter)
        : product.category === categoryFilter);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-900 dark:text-white mb-1">
            Catálogo de Productos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Administra los productos base, precios, stock y variantes disponibles para el personalizador 2D.
          </p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 h-10 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Nuevo Producto
        </Button>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por nombre, SKU..."
            className="pl-9 h-10 bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-200 dark:border-white/10 text-sm shadow-sm rounded-full text-slate-900 dark:text-white transition-all focus-visible:ring-indigo-500 focus-visible:ring-2 focus-visible:ring-offset-0 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-hide">
          {(categories.length > 0 ? ["Todos", ...categories.map(c => c.nombre)] : ["Todos", "Tazas", "Ropa", "Oficina"]).map((cat) => {
            const isActive = categoryFilter === cat;
            return (
              <Button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                variant="ghost"
                size="sm"
                className={`text-xs font-bold shrink-0 h-9 px-5 rounded-full transition-all duration-300 ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-50" 
                    : "bg-slate-100 text-slate-600 dark:text-slate-400 hover:bg-slate-200 border border-slate-200 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400 dark:hover:bg-white/10 dark:border-white/[0.08]"
                }`}
              >
                {cat}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Products Table */}
      <Card className="border border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-white/2">
              <TableRow className="border-slate-200 dark:border-white/10">
                <TableHead className="w-16 font-bold text-slate-500 dark:text-slate-400">Imagen</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Producto</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Categoría</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Personalizable</TableHead>
                <TableHead className="text-right font-bold text-slate-500 dark:text-slate-400">Precio Base</TableHead>
                <TableHead className="text-center font-bold text-slate-500 dark:text-slate-400">Variantes</TableHead>
                <TableHead className="text-center font-bold text-slate-500 dark:text-slate-400">Estado</TableHead>
                <TableHead className="w-24 text-right pr-6 font-bold text-slate-500 dark:text-slate-400">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx} className="border-slate-100 dark:border-white/5">
                    <TableCell><div className="h-11 w-11 bg-slate-200 dark:bg-white/5 rounded-xl animate-pulse" /></TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="h-4 w-44 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
                        <div className="h-3 w-60 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
                      </div>
                    </TableCell>
                    <TableCell><div className="h-4 w-20 bg-slate-200 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-12 bg-slate-200 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell className="text-right"><div className="h-4 w-14 bg-slate-200 dark:bg-white/5 rounded ml-auto animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-10 bg-slate-200 dark:bg-white/5 rounded mx-auto animate-pulse" /></TableCell>
                    <TableCell><div className="h-6 w-20 bg-slate-200 dark:bg-white/5 rounded-full mx-auto animate-pulse" /></TableCell>
                    <TableCell className="text-right pr-6"><div className="h-8 w-16 bg-slate-200 dark:bg-white/5 rounded-lg ml-auto animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const basePrice = p.variants.length > 0 ? Math.min(...p.variants.map(v => Number(v.price))) : 0;
                  const firstImg = p.variants.find(v => v.imageUrl)?.imageUrl || "/img/placeholder.png"; // Fallback image

                  return (
                    <TableRow key={p.id} className={`border-slate-100 dark:border-white/5 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.02] ${!p.isActive ? "opacity-60 bg-slate-50 dark:bg-white/[0.02]/50 dark:bg-transparent" : ""}`}>
                      <TableCell className="py-3">
                        <div className="relative h-11 w-11 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-inner">
                          <img 
                            src={firstImg} 
                            alt={p.name} 
                            className="object-cover h-10 w-10"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (!target.getAttribute('data-error')) {
                                target.setAttribute('data-error', 'true');
                                target.src = "/img/placeholder.png";
                              }
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        <div>{p.name}</div>
                        <div className="text-xs text-slate-400 font-normal truncate max-w-xs">{p.description}</div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {(p.categories && p.categories.length > 0 ? p.categories : [p.category]).map((catName, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                              {catName}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {p.isCustomizable ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 shadow-sm">
                            Sí
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-slate-100 text-slate-500 border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 shadow-sm">
                            Estándar
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-sm text-right text-slate-950 dark:text-white">
                        S/. {basePrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {p.variants.length}
                      </TableCell>
                      <TableCell className="text-center">
                        <button 
                          onClick={() => handleToggleActive(p)}
                          className="hover:scale-105 transition-transform"
                          title={p.isActive ? "Desactivar Producto" : "Activar Producto"}
                        >
                          {p.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 shadow-sm">
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
                            onClick={() => handleOpenEdit(p)}
                            className="hover:text-indigo-600 hover:bg-slate-50 dark:bg-white/2 dark:hover:bg-zinc-800 h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleToggleActive(p)}
                            className={`h-8 w-8 hover:bg-slate-50 dark:bg-white/[0.02] dark:hover:bg-zinc-800 ${p.isActive ? "text-amber-500 hover:text-amber-600" : "text-emerald-500 hover:text-emerald-600"}`}
                            title={p.isActive ? "Desactivar del catálogo" : "Activar en catálogo"}
                          >
                            {p.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setProductToDelete(p)}
                            className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20 text-slate-500 dark:text-slate-400 text-sm">
                    No se encontraron productos con los filtros actuales.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Save/Edit Product Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-2xl max-h-[92vh] p-0 rounded-3xl overflow-hidden flex flex-col">
          {/* Fixed Header */}
          <div className="p-6 pb-2 shrink-0 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/30">
            <DialogHeader>
              <DialogTitle className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
                {editingProduct ? `Editar Producto: ${editingProduct.name}` : "Registrar Nuevo Producto"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {editingProduct ? "Modifica la información general o administra las variantes y precios del catálogo." : "Crea una nueva ficha de producto y define sus variantes iniciales de venta."}
              </DialogDescription>
            </DialogHeader>

            {/* Dialog Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 p-1.5 gap-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl my-4">
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 select-none cursor-pointer ${
                  activeTab === "info" 
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/40 dark:border-white/5" 
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Info className="h-3.5 w-3.5" />
                Datos Básicos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("design")}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 select-none cursor-pointer ${
                  activeTab === "design" 
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/40 dark:border-white/5" 
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Palette className="h-3.5 w-3.5" />
                Diseño y 3D
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("specs")}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 select-none cursor-pointer ${
                  activeTab === "specs" 
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/40 dark:border-white/5" 
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                Ficha Técnica
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("variants")}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 select-none cursor-pointer ${
                  activeTab === "variants" 
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/40 dark:border-white/5" 
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Variantes ({variants.length})
              </button>
            </div>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Tab Content: Info */}
            {activeTab === "info" && (
              <div className="space-y-4 my-2 text-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-name" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre del Producto *</Label>
                  <Input 
                    id="prod-name"
                    placeholder="Ej. Termo Cilindro 600ml"
                    value={name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setName(newName);
                      // If creating a new product and first variant SKU is still using default auto-generated prefix
                      if (!editingProduct && variants.length > 0) {
                        const cleanSlug = newName
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/\s+/g, "-")
                          .replace(/[^\w\-]+/g, "")
                          .slice(0, 10)
                          .toUpperCase();
                        if (cleanSlug) {
                          setVariants(prev => {
                            if (prev.length === 0) return prev;
                            const first = prev[0];
                            if (!first.sku || first.sku.startsWith("SKU-")) {
                              const randParts = first.sku.split("-");
                              const rand = randParts.length > 2 ? randParts[randParts.length - 1] : Math.floor(1000 + Math.random() * 9000);
                              const next = [...prev];
                              next[0] = { ...first, sku: `SKU-${cleanSlug}-${rand}` };
                              return next;
                            }
                            return prev;
                          });
                        }
                      }
                    }}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prod-desc" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Descripción del Producto *</Label>
                  <Textarea 
                    id="prod-desc"
                    placeholder="Detalles sobre materiales, tamaños, durabilidad, aptitudes de lavado, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-4">
                  {/* Multi-Category Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Categorías * <span className="text-indigo-600 dark:text-indigo-400 font-bold ml-1">({selectedCategories.length} seleccionada{selectedCategories.length === 1 ? '' : 's'})</span>
                      </Label>
                    </div>
                    <div className="flex flex-wrap gap-2 p-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 min-h-[52px]">
                      {(categories.length > 0 ? categories.map(c => c.nombre) : ["Tazas", "Tomatodo", "Ropa", "Oficina", "Otros"]).map((catName) => {
                        const isSelected = selectedCategories.includes(catName);
                        return (
                          <button
                            key={catName}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                if (selectedCategories.length > 1) {
                                  setSelectedCategories(selectedCategories.filter(c => c !== catName));
                                } else {
                                  toast.error("El producto debe pertenecer a al menos 1 categoría.");
                                }
                              } else {
                                setSelectedCategories([...selectedCategories, catName]);
                              }
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 scale-[1.02]"
                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500"
                            }`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                            {catName}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Haz clic sobre una o más categorías para asignarlas a este producto.
                    </p>
                  </div>

                  {/* Custom Toggle Switch for Personalizable */}
                  <div className="flex items-center justify-between border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-slate-50 dark:bg-white/2 transition-colors hover:bg-slate-100/50 dark:hover:bg-white/4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Palette className="h-3.5 w-3.5 text-indigo-500" />
                        Personalizable
                      </span>
                      <span className="text-[10px] text-slate-450 dark:text-slate-400">Permitir subir diseños de clientes</span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={isCustomizable}
                        onChange={(e) => setIsCustomizable(e.target.checked)}
                        className="sr-only peer"
                        id="is-customizable-toggle"
                      />
                      <label htmlFor="is-customizable-toggle" className="w-9 h-5 bg-slate-250 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-305 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 cursor-pointer"></label>
                    </div>
                  </div>
                </div>

                {/* Seller Selection dropdown for Administrator */}
                {isAdmin && (
                  <div className="space-y-1.5">
                    <Label htmlFor="owner-select" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Vendedor / Propietario del Producto
                    </Label>
                    <select
                      id="owner-select"
                      value={usuarioId}
                      onChange={(e) => setUsuarioId(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-slate-900 dark:text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer font-semibold"
                    >
                      <option value="admin">Administrador (Sistema General)</option>
                      {sellers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.user_metadata?.name || s.email} ({s.rolId === "VENDEDOR" ? "Vendedor" : "Admin"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Custom Toggle Switch for Active Product */}
                <div className="flex items-center justify-between border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-slate-50 dark:bg-white/2 transition-colors hover:bg-slate-100/50 dark:hover:bg-white/4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-emerald-500" />
                      Producto Activo
                    </span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-400">Mostrar en el catálogo público de la tienda</span>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                      id="is-active-toggle"
                    />
                    <label htmlFor="is-active-toggle" className="w-9 h-5 bg-slate-250 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-305 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 cursor-pointer"></label>
                  </div>
                </div>

                {/* Custom Toggle Switch for Featured Product (Home Page) */}
                <div className="flex items-center justify-between border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-slate-50 dark:bg-white/2 transition-colors hover:bg-slate-100/50 dark:hover:bg-white/4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      Producto Destacado
                    </span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-400">Mostrar en la sección destacada de la página de inicio</span>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={destacado}
                      onChange={(e) => setDestacado(e.target.checked)}
                      className="sr-only peer"
                      id="is-destacado-toggle"
                    />
                    <label htmlFor="is-destacado-toggle" className="w-9 h-5 bg-slate-250 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-305 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 cursor-pointer"></label>
                  </div>
                </div>

                {/* Custom Toggle Switch for Best Seller Badge */}
                <div className="flex items-center justify-between border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-slate-50 dark:bg-white/2 transition-colors hover:bg-slate-100/50 dark:hover:bg-white/4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                      Producto Más Vendido
                    </span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-400">Mostrar la insignia Más Vendido en las tarjetas del catálogo</span>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={masVendido}
                      onChange={(e) => setMasVendido(e.target.checked)}
                      className="sr-only peer"
                      id="is-mas-vendido-toggle"
                    />
                    <label htmlFor="is-mas-vendido-toggle" className="w-9 h-5 bg-slate-250 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-305 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500 cursor-pointer"></label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content: Design & 3D */}
            {activeTab === "design" && (
              <div className="space-y-5 my-2 text-sm">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Modelo 3D (.glb)</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="URL o sube un archivo .glb"
                      value={glbModelUrl || ""}
                      onChange={(e) => setGlbModelUrl(e.target.value)}
                      className="rounded-xl flex-1 text-xs border-slate-200/80 bg-slate-50/60 focus:bg-white"
                    />
                    <label className="flex h-10 items-center justify-center border border-slate-200/80 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 cursor-pointer px-4 text-xs font-bold text-slate-700 gap-2 select-none shrink-0 rounded-xl transition-all">
                      {uploadingFiles["glb"] ? <Loader2 className="h-4 w-4 animate-spin text-purple-600" /> : <Upload className="h-4 w-4" />}
                      Subir
                      <input 
                        type="file" 
                        accept=".glb" 
                        onChange={(e) => handleFileUpload(e, setGlbModelUrl, "models", "glb")} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400">Si dejas este campo vacío, el visor 3D se desactiva y se usa la vista 2D.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mockup 2D */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mockup 2D (Blanco)</Label>
                    <div className="flex gap-2">
                      <div className="relative h-10 w-10 border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center shadow-xs">
                        {blankMockupUrl ? <img src={blankMockupUrl} className="object-cover w-10 h-10" /> : <ImageIcon className="h-4 w-4 text-slate-400" />}
                      </div>
                      <Input 
                        placeholder="URL de la imagen"
                        value={blankMockupUrl || ""}
                        onChange={(e) => setBlankMockupUrl(e.target.value)}
                        className="h-10 text-xs flex-1 rounded-xl border-slate-200/80 bg-slate-50/60 focus:bg-white"
                      />
                      <label className="flex h-10 w-12 items-center justify-center border border-slate-200/80 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 cursor-pointer text-slate-600 shrink-0 rounded-xl transition-all">
                        {uploadingFiles["blank"] ? <Loader2 className="h-4 w-4 animate-spin text-purple-600" /> : <Upload className="h-4 w-4" />}
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg" 
                          onChange={(e) => handleFileUpload(e, setBlankMockupUrl, "images", "blank")} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  {/* Máscara 2D */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Máscara 2D (Recorte PNG)</Label>
                    <div className="flex gap-2">
                      <div className="relative h-10 w-10 border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center shadow-xs">
                        {maskImageUrl ? <img src={maskImageUrl} className="object-cover w-10 h-10" /> : <ImageIcon className="h-4 w-4 text-slate-400" />}
                      </div>
                      <Input 
                        placeholder="URL de la máscara PNG"
                        value={maskImageUrl || ""}
                        onChange={(e) => setMaskImageUrl(e.target.value)}
                        className="h-10 text-xs flex-1 rounded-xl border-slate-200/80 bg-slate-50/60 focus:bg-white"
                      />
                      <label className="flex h-10 w-12 items-center justify-center border border-slate-200/80 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 cursor-pointer text-slate-600 shrink-0 rounded-xl transition-all">
                        {uploadingFiles["mask"] ? <Loader2 className="h-4 w-4 animate-spin text-purple-600" /> : <Upload className="h-4 w-4" />}
                        <input 
                          type="file" 
                          accept="image/png" 
                          onChange={(e) => handleFileUpload(e, setMaskImageUrl, "images", "mask")} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Galería de imágenes interactiva */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Galería de Imágenes</Label>
                      <span className="text-[10px] text-slate-400">Fotos adicionales del catálogo público</span>
                    </div>
                    <div className="relative">
                      <input type="file" accept="image/png, image/jpeg" multiple onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        const newUrls = files.map(file => {
                          const previewUrl = URL.createObjectURL(file);
                          pendingFilesRef.current[previewUrl] = { file, type: "images" };
                          return previewUrl;
                        });
                        setGalleryImages(prev => [...prev, ...newUrls]);
                        toast.info(`${files.length} foto(s) añadidas a la vista previa.`);
                      }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <Button type="button" variant="outline" size="sm" className="h-8 text-xs py-0 font-bold text-purple-700 border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 rounded-xl">
                        {uploadingFiles["gallery"] ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                        Agregar Fotos
                      </Button>
                    </div>
                  </div>

                  {/* Grid Visual de Miniaturas */}
                  <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-200/60">
                    {galleryImages.length > 0 ? (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {galleryImages.map((imgUrl, i) => (
                          <div key={i} className="relative aspect-square group border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-xs">
                            <img src={imgUrl} alt={`Galería ${i}`} className="object-cover w-full h-full" />
                            <button 
                              type="button" 
                              onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                              className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white hover:text-red-400 transition-opacity rounded-xl cursor-pointer"
                              title="Eliminar de galería"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-purple-200/80 bg-white/80 rounded-2xl p-6 text-center text-xs text-slate-500 font-medium">
                        No hay imágenes en la galería. Agrega fotos usando el botón de arriba.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content: Specs */}
            {activeTab === "specs" && (
              <div className="space-y-6 my-2 text-sm">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dimensiones de la Plantilla Plana (Área de Impresión)</Label>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-1 w-full">
                      <span className="text-[10px] text-slate-400 font-bold">Ancho (cm)</span>
                      <Input 
                        type="number" step="0.1" placeholder="Ej. 20"
                        value={printWidth || ""} onChange={(e) => setPrintWidth(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <span className="text-[10px] text-slate-400 font-bold">Alto (cm)</span>
                      <Input 
                        type="number" step="0.1" placeholder="Ej. 9.5"
                        value={printHeight || ""} onChange={(e) => setPrintHeight(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Características del Producto */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Características (Especificaciones)</Label>
                      <span className="text-[10px] text-slate-400">Atributos técnicos del material o producto</span>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] py-0 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-850 dark:hover:bg-indigo-900/40 font-bold" onClick={() => setFeatures([...features, {label: "", value: ""}])}>
                      <Plus className="h-3 w-3 mr-1" /> Añadir Fila
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {features.map((f, i) => (
                      <div key={i} className="flex gap-2 items-center bg-slate-50 dark:bg-white/1 p-1.5 rounded-xl border border-slate-100 dark:border-white/5">
                        <Input placeholder="Ej. Material" value={f.label} onChange={(e) => { const n = [...features]; n[i] = { ...n[i], label: e.target.value }; setFeatures(n); }} className="w-1/3 h-8 text-xs bg-white dark:bg-slate-900" />
                        <Input placeholder="Ej. Cerámica Premium" value={f.value} onChange={(e) => { const n = [...features]; n[i] = { ...n[i], value: e.target.value }; setFeatures(n); }} className="h-8 text-xs bg-white dark:bg-slate-900 flex-1" />
                        <button type="button" onClick={() => setFeatures(features.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                    {features.length === 0 && <p className="text-[11px] text-slate-400 italic text-center py-2">No hay características añadidas.</p>}
                  </div>
                </div>

                {/* Beneficios del Producto */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Beneficios del Producto</Label>
                      <span className="text-[10px] text-slate-400">Puntos de venta destacados para el cliente</span>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] py-0 border-indigo-200 text-indigo-650 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-850 dark:hover:bg-indigo-900/40 font-bold" onClick={() => setBenefits([...benefits, ""])}>
                      <Plus className="h-3 w-3 mr-1" /> Añadir Fila
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {benefits.map((b, i) => (
                      <div key={i} className="flex gap-2 items-center bg-slate-50 dark:bg-white/1 p-1.5 rounded-xl border border-slate-100 dark:border-white/5">
                        <Input placeholder="Ej. Apto para microondas y lavavajillas..." value={b} onChange={(e) => { const n = [...benefits]; n[i] = e.target.value; setBenefits(n); }} className="h-8 text-xs bg-white dark:bg-slate-900 flex-1" />
                        <button type="button" onClick={() => setBenefits(benefits.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                    {benefits.length === 0 && <p className="text-[11px] text-slate-400 italic text-center py-2">No hay beneficios añadidos.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content: Variants */}
            {activeTab === "variants" && (
              <div className="space-y-4 my-2">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-505">Listado de Variantes</h4>
                    <span className="text-[10px] text-slate-400">Variaciones de tamaño, color o material del catálogo</span>
                  </div>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleAddVariant}
                    className="border-indigo-200 text-indigo-655 hover:bg-indigo-50 text-xs font-bold flex items-center gap-1.5 h-8 dark:text-indigo-400 dark:border-indigo-850 dark:hover:bg-indigo-900/40"
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Agregar Variante
                  </Button>
                </div>

                <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                  {variants.map((v, index) => (
                    <div key={index} className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/60 dark:bg-white/2 flex flex-col gap-3 relative hover:border-purple-300 transition-all shadow-xs">
                      
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2">
                        <span className="text-xs font-extrabold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5" /> Variante #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(index)}
                          className="text-slate-400 hover:text-red-500 text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          title="Eliminar variante"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Eliminar
                        </button>
                      </div>

                      {/* Inputs Grid with Full Widths */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        {/* Title */}
                        <div className="sm:col-span-4 space-y-1">
                          <Label className="text-[11px] uppercase font-extrabold text-slate-700 dark:text-slate-300 block">Título *</Label>
                          <Input 
                            placeholder="Ej. Blanca 11oz"
                            value={v.title}
                            onChange={(e) => handleUpdateVariant(index, "title", e.target.value)}
                            className="h-10 text-xs font-bold text-slate-900 bg-white border-slate-300 rounded-xl"
                          />
                        </div>

                        {/* SKU */}
                        <div className="sm:col-span-4 space-y-1">
                          <Label className="text-[11px] uppercase font-extrabold text-slate-700 dark:text-slate-300 block">SKU *</Label>
                          <Input 
                            placeholder="MUG-WH-11"
                            value={v.sku}
                            onChange={(e) => handleUpdateVariant(index, "sku", e.target.value)}
                            className="h-10 text-xs font-mono font-bold text-slate-900 bg-white border-slate-300 rounded-xl"
                          />
                        </div>

                        {/* Price */}
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-[11px] uppercase font-extrabold text-slate-700 dark:text-slate-300 block">Precio (S/.) *</Label>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="15.00"
                            value={v.price || ""}
                            onChange={(e) => handleUpdateVariant(index, "price", parseFloat(e.target.value) || 0)}
                            className="h-10 text-xs font-extrabold text-slate-900 bg-white border-slate-300 rounded-xl px-2.5"
                          />
                        </div>

                        {/* Stock */}
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-[11px] uppercase font-extrabold text-slate-700 dark:text-slate-300 block">Stock *</Label>
                          <Input 
                            type="number"
                            placeholder="100"
                            value={v.stock !== undefined ? v.stock : ""}
                            onChange={(e) => handleUpdateVariant(index, "stock", parseInt(e.target.value) || 0)}
                            className="h-10 text-xs font-bold text-slate-900 bg-white border-slate-300 rounded-xl px-2.5"
                          />
                        </div>
                      </div>

                      {/* Bottom Row: Image Upload & 3D/2D Config */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200/60 dark:border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase">Imagen de Variante:</span>
                          <div className="relative h-9 w-9 border border-slate-200 rounded-xl overflow-hidden bg-white shrink-0 flex items-center justify-center">
                            {v.imageUrl ? (
                              <img src={v.imageUrl} alt={v.title || "Variante"} className="object-cover h-9 w-9" />
                            ) : (
                              <Package className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                          <label className="flex h-8 px-3 items-center justify-center border border-slate-300 rounded-xl bg-white hover:bg-purple-50 hover:border-purple-300 cursor-pointer text-xs font-bold text-slate-700 gap-1.5 select-none transition-all">
                            <Upload className="h-3.5 w-3.5 text-purple-600" />
                            Subir Foto
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => handleVariantImageUpload(index, e)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditingVariantIndex(index)}
                          className={`h-8 px-4 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl border cursor-pointer ${
                            (v.glbModelUrl || v.blankMockupUrl || v.maskImageUrl || v.printDimensions)
                              ? "text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100"
                              : "text-slate-600 bg-white hover:bg-slate-50 border-slate-300"
                          }`}
                        >
                          <Settings2 className="h-3.5 w-3.5" />
                          {(v.glbModelUrl || v.blankMockupUrl || v.maskImageUrl || v.printDimensions) ? "Configuración Personalizada" : "Configuración Heredada"}
                        </Button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer Actions */}
          <div className="border-t border-slate-100 p-4 bg-slate-50/60 flex justify-end gap-3 shrink-0 rounded-b-2xl">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
              className="text-xs h-9 px-4 font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border-none cursor-pointer"
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold gap-1.5 h-9 px-5 rounded-xl shadow-md shadow-purple-600/20 border-none transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Guardar Producto
                </>
              )}
            </Button>
          </div>

        </DialogContent>
      </Dialog>

      {/* Dialog para Activos de Personalización por Variante */}
      <Dialog open={editingVariantIndex !== null} onOpenChange={(open) => !open && setEditingVariantIndex(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-2xl p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-indigo-500" />
              Personalización de Variante
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Define archivos específicos para: <b>{editingVariantIndex !== null ? variants[editingVariantIndex]?.title || `Variante ${editingVariantIndex + 1}` : ""}</b>. Si se dejan vacíos, heredará los del producto base.
            </DialogDescription>
          </DialogHeader>

          {editingVariantIndex !== null && (
            <div className="space-y-4 my-2 text-sm">
              {/* glbModelUrl */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Modelo 3D (.glb)</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="URL o subir archivo .glb"
                    value={variants[editingVariantIndex]?.glbModelUrl || ""}
                    onChange={(e) => handleUpdateVariant(editingVariantIndex, "glbModelUrl", e.target.value)}
                    className="h-9 text-xs"
                  />
                  <label className="flex h-9 items-center justify-center border bg-slate-50 dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 border-slate-300 dark:border-white/10 cursor-pointer px-4 text-xs font-semibold text-slate-700 dark:text-slate-200 gap-1.5 select-none shrink-0 rounded-xl">
                    {uploadingFiles[`v-glb-${editingVariantIndex}`] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    Subir
                    <input 
                      type="file" 
                      accept=".glb" 
                      onChange={(e) => handleFileUpload(e, (url) => handleUpdateVariant(editingVariantIndex, "glbModelUrl", url), "models", `v-glb-${editingVariantIndex}`)} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* blankMockupUrl */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Mockup 2D (Blanco)</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="URL o subir imagen de mockup"
                    value={variants[editingVariantIndex]?.blankMockupUrl || ""}
                    onChange={(e) => handleUpdateVariant(editingVariantIndex, "blankMockupUrl", e.target.value)}
                    className="h-9 text-xs"
                  />
                  <label className="flex h-9 items-center justify-center border bg-slate-50 dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 border-slate-300 dark:border-white/10 cursor-pointer px-4 text-xs font-semibold text-slate-700 dark:text-slate-200 gap-1.5 select-none shrink-0 rounded-xl">
                    {uploadingFiles[`v-blank-${editingVariantIndex}`] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    Subir
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg" 
                      onChange={(e) => handleFileUpload(e, (url) => handleUpdateVariant(editingVariantIndex, "blankMockupUrl", url), "images", `v-blank-${editingVariantIndex}`)} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* maskImageUrl */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Máscara 2D (Transparente PNG)</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="URL o subir máscara PNG"
                    value={variants[editingVariantIndex]?.maskImageUrl || ""}
                    onChange={(e) => handleUpdateVariant(editingVariantIndex, "maskImageUrl", e.target.value)}
                    className="h-9 text-xs"
                  />
                  <label className="flex h-9 items-center justify-center border bg-slate-50 dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 border-slate-300 dark:border-white/10 cursor-pointer px-4 text-xs font-semibold text-slate-700 dark:text-slate-200 gap-1.5 select-none shrink-0 rounded-xl">
                    {uploadingFiles[`v-mask-${editingVariantIndex}`] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    Subir
                    <input 
                      type="file" 
                      accept="image/png" 
                      onChange={(e) => handleFileUpload(e, (url) => handleUpdateVariant(editingVariantIndex, "maskImageUrl", url), "images", `v-mask-${editingVariantIndex}`)} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* printDimensions */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Área de Impresión (Plantilla Plana)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-bold">Ancho (cm)</span>
                    <Input 
                      type="number" step="0.1" placeholder="Ej. 20"
                      value={variants[editingVariantIndex]?.printDimensions?.width || ""}
                      onChange={(e) => {
                        const width = parseFloat(e.target.value) || 0;
                        const height = variants[editingVariantIndex]?.printDimensions?.height || 0;
                        handleUpdateVariant(editingVariantIndex, "printDimensions", width || height ? { width, height } : null);
                      }}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-bold">Alto (cm)</span>
                    <Input 
                      type="number" step="0.1" placeholder="Ej. 9.5"
                      value={variants[editingVariantIndex]?.printDimensions?.height || ""}
                      onChange={(e) => {
                        const height = parseFloat(e.target.value) || 0;
                        const width = variants[editingVariantIndex]?.printDimensions?.width || 0;
                        handleUpdateVariant(editingVariantIndex, "printDimensions", width || height ? { width, height } : null);
                      }}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-4 flex justify-end">
            <Button 
              type="button" 
              onClick={() => setEditingVariantIndex(null)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold h-9 px-4 rounded-xl shadow-sm"
            >
              Aceptar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación para Eliminar Producto */}
      <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 rounded-2xl p-6">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg font-heading font-extrabold text-slate-900 dark:text-white">
              ¿Eliminar producto permanentemente?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
              Estás a punto de eliminar <span className="font-bold text-slate-700 dark:text-slate-200">"{productToDelete?.name}"</span> de la base de datos. Se eliminarán sus variantes y configuraciones.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setProductToDelete(null)}
              disabled={isDeletingProduct}
              className="rounded-xl h-10 text-xs font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeletingProduct}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 text-xs font-bold gap-2 px-4 shadow-md shadow-rose-600/20"
            >
              {isDeletingProduct ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Sí, eliminar producto
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
