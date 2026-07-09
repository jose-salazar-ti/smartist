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
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Eye, 
  Check, 
  Play, 
  Truck, 
  XCircle, 
  Search, 
  Download, 
  Phone,
  Calendar,
  AlertCircle,
  Package,
  User,
  CreditCard,
  Palette,
  ShoppingBag,
  Image,
  FileSpreadsheet,
  Gift,
  Music
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface OrderCustomization {
  userDesignUrl: string;
  details: {
    userDesignUrlRight?: string;
    customText?: string;
    customTextRight?: string;
    textColor?: string;
    textFont?: string;
    scale?: number;
    x?: number;
    y?: number;
    rotation?: number;
    scaleRight?: number;
    xRight?: number;
    yRight?: number;
    rotationRight?: number;
    textCurve?: number;
    textCurveRight?: number;
    textShadowEnabled?: boolean;
    textShadowColor?: string;
    textShadowBlur?: number;
    textShadowOffset?: number;
    mugDesignMode?: string;
  };
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  variant: {
    title: string;
    sku: string;
    product: {
      name: string;
      category: string;
    };
  };
  customization?: OrderCustomization | null;
}

interface Order {
  id: string;
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "CANCELLED";
  totalAmount: number;
  pickupMethod: "PICKUP" | "DELIVERY";
  shippingAddress?: string | null;
  shippingDistrict?: string | null;
  voucherUrl?: string | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  } | null;
  orderItems: OrderItem[];
  telfClienteFinal?: string | null;
  nombreClienteFinal?: string | null;
  dedicatoria?: any | null;
}

interface DBStatus {
  id: string;
  nombre: string;
  color: string;
  descripcion?: string | null;
  emailTitulo?: string | null;
  emailDescripcion?: string | null;
}

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<DBStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selected Order for detail view modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleDownloadFile = async (url: string, filename: string) => {
    const toastId = toast.loading("Preparando descarga HD...");
    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Descarga iniciada con éxito", { id: toastId });
    } catch (err) {
      console.error("Direct download failed, falling back to new tab:", err);
      window.open(url, "_blank");
      toast.success("Abriendo en nueva pestaña", { id: toastId });
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders", err);
      toast.error("Error al conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const res = await fetch("/api/estados-pedido");
      if (res.ok) {
        const data = await res.json();
        setStatuses(data);
      }
    } catch (err) {
      console.error("Failed to load statuses", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStatuses();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    const toastId = toast.loading(`Actualizando estado a ${newStatus}...`);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Estado de pedido actualizado.", { id: toastId });
        
        // Refresh local orders list
        await fetchOrders();
        
        // Update currently selected modal view
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
        }
      } else {
        const errMsg = data.error && data.error.length < 120 ? data.error : "Error al actualizar el pedido.";
        toast.error(errMsg, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de red al actualizar estado.", { id: toastId });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const exportToExcel = () => {
    try {
      if (filteredOrders.length === 0) {
        toast.error("No hay pedidos para exportar con los filtros actuales.");
        return;
      }

      const statusMap: Record<string, string> = {};
      statuses.forEach((s) => {
        statusMap[s.id] = s.nombre;
      });

      const excelData = filteredOrders.map((order) => {
        const itemsSummary = order.orderItems
          .map((item) => `${item.variant?.product?.name || "Producto"} (${item.variant?.title || "Estándar"}) x${item.quantity}`)
          .join(" | ");

        return {
          "ID Pedido": order.id.toUpperCase(),
          "Fecha": new Date(order.createdAt).toLocaleDateString("es-PE"),
          "Cliente": order.user?.name || "Invitado",
          "Correo": order.user?.email || "N/A",
          "Método Entrega": order.pickupMethod === "DELIVERY" ? "Envío a Domicilio" : "Recojo en Tienda",
          "Dirección Envío": order.shippingAddress || "N/A",
          "Distrito Envío": order.shippingDistrict || "N/A",
          "Monto Total (S/.)": Number(order.totalAmount),
          "Estado": statusMap[order.status] || order.status,
          "Productos": itemsSummary
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos Smartist");

      const maxColWidths = Object.keys(excelData[0]).map((key) => {
        let maxLen = key.length;
        excelData.forEach((row: any) => {
          const val = row[key] ? String(row[key]) : "";
          if (val.length > maxLen) maxLen = val.length;
        });
        return { wch: maxLen + 3 };
      });
      worksheet["!cols"] = maxColWidths;

      const timestamp = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `Reporte_Pedidos_Smartist_${timestamp}.xlsx`);
      toast.success("Listado de pedidos exportado a Excel.");
    } catch (err) {
      console.error("Failed to export Excel", err);
      toast.error("Error al generar el reporte de Excel.");
    }
  };

  // Filter logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-900 dark:text-white mb-1">
            Gestión de Pedidos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Valida comprobantes de pago de Yape/Plin, descarga archivos de impresión y gestiona el despacho.
          </p>
        </div>
        <Button 
          onClick={exportToExcel}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 h-10 shadow-sm shrink-0 rounded-xl cursor-pointer"
        >
          <FileSpreadsheet className="h-4.5 w-4.5" /> Exportar a Excel
        </Button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por ID, cliente, email..."
            className="pl-9 h-10 bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-200 dark:border-white/10 text-sm shadow-sm rounded-full text-slate-900 dark:text-white transition-all focus-visible:ring-indigo-500 focus-visible:ring-2 focus-visible:ring-offset-0 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-hide">
          <Button
            onClick={() => setStatusFilter("ALL")}
            variant="ghost"
            size="sm"
            className={`text-xs font-bold shrink-0 h-9 px-5 rounded-full transition-all duration-300 ${
              statusFilter === "ALL" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500" 
                : "bg-slate-100 text-slate-600 dark:text-slate-400 hover:bg-slate-200 border border-slate-200 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400 dark:hover:bg-white/10 dark:border-white/[0.08]"
            }`}
          >
            Todos
          </Button>
          {statuses.map((status) => {
            const isActive = statusFilter === status.id;

            return (
              <Button
                key={status.id}
                onClick={() => setStatusFilter(status.id)}
                variant="ghost"
                size="sm"
                className={`text-xs font-bold shrink-0 h-9 px-5 rounded-full transition-all duration-300 ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500" 
                    : "bg-slate-100 text-slate-600 dark:text-slate-400 hover:bg-slate-200 border border-slate-200 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400 dark:hover:bg-white/10 dark:border-white/[0.08]"
                }`}
              >
                {status.nombre}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <Card className="border border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-white/[0.02]/80 dark:bg-white/[0.02]">
              <TableRow className="border-slate-200 dark:border-white/10 dark:border-white/[0.05]">
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Pedido</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Cliente</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Fecha</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Entrega</TableHead>
                <TableHead className="text-right font-bold text-slate-500 dark:text-slate-400">Total</TableHead>
                <TableHead className="font-bold text-slate-500 dark:text-slate-400">Estado</TableHead>
                <TableHead className="w-16 font-bold text-slate-500 dark:text-slate-400"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx} className="border-slate-100 dark:border-white/5 dark:border-white/[0.05]">
                    <TableCell><div className="h-4 w-16 bg-slate-200 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="h-4 w-32 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
                        <div className="h-3 w-40 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
                      </div>
                    </TableCell>
                    <TableCell><div className="h-4 w-20 bg-slate-200 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-slate-200 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                    <TableCell className="text-right"><div className="h-4 w-14 bg-slate-200 dark:bg-white/5 rounded ml-auto animate-pulse" /></TableCell>
                    <TableCell><div className="h-6 w-20 bg-slate-200 dark:bg-white/5 rounded-full animate-pulse" /></TableCell>
                    <TableCell><div className="h-8 w-8 bg-slate-200 dark:bg-white/5 rounded-lg animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const dbStatus = statuses.find(s => s.id === order.status);
                  const statusLabel = dbStatus ? dbStatus.nombre : order.status;
                  const statusColor = dbStatus ? dbStatus.color : "indigo";
                  const statusClass = getStatusBadgeClass(statusColor);

                  return (
                    <TableRow key={order.id} className="border-slate-100 dark:border-white/5 dark:border-white/[0.05] transition-colors hover:bg-slate-50 dark:bg-white/[0.02]/80 dark:hover:bg-white/[0.02]">
                      <TableCell className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{order.user?.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <span>{order.user?.email}</span>
                          {order.dedicatoria && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                              <Gift className="h-2.5 w-2.5" /> Sorpresa
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString("es-PE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                        {order.pickupMethod === "DELIVERY" ? (
                          <span>Envío a {order.shippingDistrict}</span>
                        ) : (
                          <span>Recojo en taller</span>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-sm text-right text-slate-950 dark:text-white">
                        S/. {Number(order.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase border shadow-sm ${statusClass}`}>
                          {order.status === "PAID" || order.status === "PROCESSING" ? <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span> : null}
                          {statusLabel}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openDetails(order)}
                          className="hover:text-indigo-600 hover:bg-slate-50 dark:bg-white/[0.02] h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 text-slate-500 dark:text-slate-400 text-sm">
                    No se encontraron pedidos con los filtros actuales.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Selected Order Details Modal (shadcn Dialog) */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl bg-white dark:bg-[#07060e]/95 dark:backdrop-blur-3xl ring-0 border border-slate-200 dark:border-white/5 shadow-2xl rounded-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
          {selectedOrder && (
            <>
              {/* Premium Gradient Header - Compact */}
              <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 shrink-0 flex justify-between items-center">
                <DialogHeader className="relative z-10 flex flex-row items-center gap-4">
                  <DialogTitle className="font-heading font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="text-indigo-600 dark:text-indigo-400">#</span>
                    {selectedOrder.id.slice(0, 8).toUpperCase()}
                  </DialogTitle>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                    <Calendar className="h-3 w-3 text-indigo-400" />
                    <span>
                      {new Date(selectedOrder.createdAt).toLocaleDateString("es-PE", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                </DialogHeader>
                <div className="opacity-20 pointer-events-none hidden sm:block mr-8">
                  <Package className="h-10 w-10 text-indigo-400" />
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8 text-sm overflow-y-auto custom-scrollbar">
                
                {/* Col Left: Client & Delivery Info & Payment Voucher */}
                <div className="space-y-6">
                  {/* Contact Card */}
                  <div className="bg-slate-50 dark:bg-white/[0.02] rounded-xl p-5 border border-slate-100 dark:border-white/5 space-y-3">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
                      <User className="h-4 w-4 text-indigo-400" /> Contacto
                    </h3>
                    <div>
                      <p className="font-bold text-base text-slate-900 dark:text-white">{selectedOrder.user?.name}</p>
                      <p className="text-slate-600 dark:text-slate-400">{selectedOrder.user?.email}</p>
                    </div>
                    {/* Direct WhatsApp Call link - Dynamic and Premium Styled */}
                    <a 
                      href={`https://wa.me/${selectedOrder.telfClienteFinal ? selectedOrder.telfClienteFinal.replace(/[^0-9]/g, "") : "51999999999"}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full gap-2 font-bold bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-90 text-white py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 mt-4 text-sm hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Phone className="h-4 w-4" />
                      Escribir al WhatsApp
                    </a>
                  </div>

                  {/* Shipping Card */}
                  <div className="bg-slate-50 dark:bg-white/[0.02] rounded-xl p-5 border border-slate-100 dark:border-white/5 space-y-3">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
                      <Truck className="h-4 w-4 text-indigo-400" /> Despacho
                    </h3>
                    <div className="flex justify-between items-center bg-white dark:bg-white/5 p-3 rounded-lg">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Método</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded text-xs">
                        {selectedOrder.pickupMethod === "DELIVERY" ? "Envío a domicilio" : "Recojo en tienda"}
                      </span>
                    </div>
                    {selectedOrder.pickupMethod === "DELIVERY" && (
                      <div className="bg-white dark:bg-white/5 p-3 rounded-lg">
                        <span className="text-slate-500 dark:text-slate-400 font-medium text-xs block mb-1">Dirección Exacta</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{selectedOrder.shippingAddress}, {selectedOrder.shippingDistrict}</span>
                      </div>
                    )}
                  </div>

                  {/* Payment capture inspect */}
                  <div className="space-y-3 pt-2">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
                      <CreditCard className="h-4 w-4 text-emerald-400" /> Voucher de Pago
                    </h3>
                    {selectedOrder.voucherUrl ? (
                      <div className="border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden shadow-sm relative group bg-slate-50 dark:bg-white/[0.02] max-h-48 flex items-center justify-center">
                        <img 
                          src={selectedOrder.voucherUrl} 
                          alt="Comprobante de pago" 
                          className="object-contain max-h-48 w-full"
                        />
                        <a 
                          href={selectedOrder.voucherUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute bottom-2 right-2 bg-slate-900/80 text-white rounded p-1 hover:bg-slate-950/90 shadow transition-colors flex items-center gap-1 text-[10px]"
                        >
                          <Eye className="h-3 w-3" /> Ampliar
                        </a>
                      </div>
                    ) : (
                      <div className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 p-3 rounded-lg border border-amber-100">
                        <AlertCircle className="h-4 w-4" />
                        No se ha cargado comprobante de pago.
                      </div>
                    )}
                  </div>

                  {/* Dedicatoria Card */}
                  {selectedOrder.dedicatoria && (
                    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:bg-white/[0.02] rounded-xl p-5 border border-indigo-100/50 dark:border-white/5 space-y-3 mt-4">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
                        <Gift className="h-4 w-4 text-indigo-500" /> Dedicatoria Digital
                      </h3>
                      <div className="space-y-2 bg-white dark:bg-black/20 p-3 rounded-lg border border-slate-150 dark:border-white/5">
                        <p className="text-xs text-slate-500">De parte de: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedOrder.dedicatoria.remitente}</span></p>
                        <p className="text-xs text-slate-500">Para: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedOrder.dedicatoria.destinatario}</span></p>
                        <p className="text-xs italic text-slate-700 dark:text-slate-300 font-serif border-l-2 border-indigo-400 pl-2 py-0.5">
                          "{selectedOrder.dedicatoria.mensaje}"
                        </p>
                        {selectedOrder.dedicatoria.spotifyUri && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1 bg-slate-50 dark:bg-white/5 p-1 rounded">
                            <Music className="h-3 w-3 text-indigo-400" />
                            <span className="truncate">Spotify: {selectedOrder.dedicatoria.spotifyUri}</span>
                          </div>
                        )}
                      </div>
                      <a 
                        href={`/regalo/${selectedOrder.dedicatoria.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full gap-2 font-bold bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl transition-all shadow-md mt-2 text-xs cursor-pointer text-center"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ver Dedicatoria Completa
                      </a>
                    </div>
                  )}
                </div>

                {/* Col Right: Custom prints & Items */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
                    <Palette className="h-4 w-4 text-rose-400" /> Archivos de Producción
                  </h3>
                  
                  <div className="space-y-4">
                    {selectedOrder.orderItems.map((item) => (
                      <div key={item.id} className="relative overflow-hidden border-0 rounded-2xl p-4 bg-slate-50 dark:bg-white/[0.03] space-y-3 shadow-inner shadow-white/5">
                        {/* Soft background glow */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        
                        <div className="flex justify-between font-bold text-slate-900 dark:text-white relative z-10">
                          <span className="font-semibold text-base">{item.variant.product.name}</span>
                          <span className="text-indigo-600 dark:text-indigo-400">S/. {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 bg-white dark:bg-black/20 w-fit px-2 py-1 rounded-md relative z-10">
                          <ShoppingBag className="h-3 w-3" />
                          <span>{item.variant.title}</span>
                          <span className="text-slate-300 dark:text-slate-600 mx-1">|</span>
                          <span className="font-bold">Qty: {item.quantity}</span>
                        </div>

                        {/* File downloads and customize details */}
                        {item.customization ? (
                          <div className="pt-2 border-t border-dashed border-slate-200 dark:border-white/10 space-y-2">
                            {item.customization.details?.mugDesignMode === "duplicated" && (
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Diseño Duplicado (Lado A y B son idénticos)</span>
                            )}
                            {item.customization.details?.mugDesignMode === "independent" && (
                              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">Diseño Independiente (Lado A y B son distintos)</span>
                            )}

                            {/* Lado A / Único */}
                            {(item.customization.userDesignUrl || item.customization.details?.customText) && (
                              <div className="bg-white dark:bg-black/20 border border-slate-100 dark:border-white/5 p-4 rounded-xl space-y-3 relative z-10">
                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-2">
                                  {item.customization.details?.mugDesignMode === "independent" ? "Diseño Lado A" : "Diseño Principal"}
                                </span>
                                
                                {item.customization.userDesignUrl && (
                                  <div className="flex justify-between items-center gap-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 p-2 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <div className="bg-indigo-500/10 p-1.5 rounded-md">
                                        <Image className="h-4 w-4 text-indigo-400" />
                                      </div>
                                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Alta Resolución</span>
                                    </div>
                                    <button 
                                      onClick={() => handleDownloadFile(
                                        item.customization!.userDesignUrl,
                                        `disenoA_${selectedOrder.id.slice(0, 8).toUpperCase()}_${item.id.slice(0, 4)}.png`
                                      )}
                                      className="flex items-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 text-xs font-bold transition-all shadow-lg shadow-indigo-500/25 shrink-0 cursor-pointer"
                                    >
                                      <Download className="h-4 w-4" /> Bajar HD
                                    </button>
                                  </div>
                                )}
                                
                                {item.customization.details?.customText && (
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Texto a Estampar</span>
                                    <p className="font-bold text-slate-900 dark:text-slate-100">"{item.customization.details.customText}"</p>
                                    <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono flex flex-wrap gap-x-3 gap-y-1">
                                      <span>Color: <span className="font-bold uppercase" style={{color: item.customization.details.textColor}}>{item.customization.details.textColor}</span></span>
                                      <span>Font: <span className="font-bold">{item.customization.details.textFont}</span></span>
                                      {item.customization.details.textCurve !== 0 && (
                                        <span>Curva: <span className="font-bold">{item.customization.details.textCurve}%</span></span>
                                      )}
                                    </div>
                                    {item.customization.details.textShadowEnabled && (
                                      <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono flex flex-wrap gap-x-3 gap-y-1 bg-slate-50 dark:bg-white/[0.02] p-1 rounded">
                                        <span>Sombra: <span className="font-bold uppercase" style={{color: item.customization.details.textShadowColor}}>{item.customization.details.textShadowColor}</span></span>
                                        <span>Blur: {item.customization.details.textShadowBlur}px</span>
                                        <span>Offset: {item.customization.details.textShadowOffset}px</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {item.customization.userDesignUrl && (
                                  <div className="text-[9px] font-mono text-slate-400 flex flex-wrap gap-x-3 gap-y-1 bg-slate-50 dark:bg-white/[0.02] p-1 rounded">
                                    <span>Scale: {item.customization.details?.scale}%</span>
                                    <span>Offset: ({item.customization.details?.x}px, {item.customization.details?.y}px)</span>
                                    <span>Rot: {item.customization.details?.rotation}°</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Lado B */}
                            {(item.customization.details?.userDesignUrlRight || item.customization.details?.customTextRight) && (
                              <div className="bg-white dark:bg-black/20 border border-slate-100 dark:border-white/5 p-4 rounded-xl space-y-3 relative z-10">
                                <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest block mb-2">
                                  Diseño Lado B
                                </span>
                                
                                {item.customization.details?.userDesignUrlRight && (
                                  <div className="flex justify-between items-center gap-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 p-2 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <div className="bg-purple-500/10 p-1.5 rounded-md">
                                        <Image className="h-4 w-4 text-purple-400" />
                                      </div>
                                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Alta Resolución</span>
                                    </div>
                                    <button 
                                      onClick={() => handleDownloadFile(
                                        item.customization!.details?.userDesignUrlRight || "",
                                        `disenoB_${selectedOrder.id.slice(0, 8).toUpperCase()}_${item.id.slice(0, 4)}.png`
                                      )}
                                      className="flex items-center gap-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 text-xs font-bold transition-all shadow-lg shadow-purple-500/25 shrink-0 cursor-pointer"
                                    >
                                      <Download className="h-4 w-4" /> Bajar HD
                                    </button>
                                  </div>
                                )}
                                
                                {item.customization.details?.customTextRight && (
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Texto a Estampar</span>
                                    <p className="font-bold text-slate-900 dark:text-slate-100">"{item.customization.details.customTextRight}"</p>
                                    <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono flex flex-wrap gap-x-3 gap-y-1">
                                      <span>Color: <span className="font-bold uppercase" style={{color: item.customization.details.textColor}}>{item.customization.details.textColor}</span></span>
                                      <span>Font: <span className="font-bold">{item.customization.details.textFont}</span></span>
                                      {item.customization.details.textCurveRight !== 0 && (
                                        <span>Curva: <span className="font-bold">{item.customization.details.textCurveRight}%</span></span>
                                      )}
                                    </div>
                                    {item.customization.details.textShadowEnabled && (
                                      <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono flex flex-wrap gap-x-3 gap-y-1 bg-slate-50 dark:bg-white/[0.02] p-1 rounded">
                                        <span>Sombra: <span className="font-bold uppercase" style={{color: item.customization.details.textShadowColor}}>{item.customization.details.textShadowColor}</span></span>
                                        <span>Blur: {item.customization.details.textShadowBlur}px</span>
                                        <span>Offset: {item.customization.details.textShadowOffset}px</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {item.customization.details.userDesignUrlRight && (
                                  <div className="text-[9px] font-mono text-slate-400 flex flex-wrap gap-x-3 gap-y-1 bg-slate-50 dark:bg-white/[0.02] p-1 rounded">
                                    <span>Scale: {item.customization.details?.scaleRight}%</span>
                                    <span>Offset: ({item.customization.details?.xRight}px, {item.customization.details?.yRight}px)</span>
                                    <span>Rot: {item.customization.details?.rotationRight}°</span>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 italic">Producto estándar, sin personalización.</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Footer Actions - Fixed at bottom */}
              <div className="shrink-0 p-4 sm:p-5 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Monto Total del Pedido</span>
                  <span className="text-lg font-extrabold text-slate-950 dark:text-white">
                    S/. {Number(selectedOrder.totalAmount).toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  {selectedOrder.status === "PENDING" && statuses.some(s => s.id === "PAID") && (
                    <Button 
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus(selectedOrder.id, "PAID")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1.5 h-9"
                    >
                      <Check className="h-4 w-4" /> Validar Pago
                    </Button>
                  )}

                  {selectedOrder.status === "PAID" && statuses.some(s => s.id === "PROCESSING") && (
                    <Button 
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus(selectedOrder.id, "PROCESSING")}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs gap-1.5 h-9"
                    >
                      <Play className="h-4 w-4" /> Iniciar Producción
                    </Button>
                  )}

                  {selectedOrder.status === "PROCESSING" && statuses.some(s => s.id === "SHIPPED") && (
                    <Button 
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus(selectedOrder.id, "SHIPPED")}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs gap-1.5 h-9"
                    >
                      <Truck className="h-4 w-4" /> Marcar como Enviado / Listo
                    </Button>
                  )}

                  {selectedOrder.status !== "SHIPPED" && selectedOrder.status !== "CANCELLED" && statuses.some(s => s.id === "CANCELLED") && (
                    <Button 
                      variant="outline"
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus(selectedOrder.id, "CANCELLED")}
                      className="border-red-200 text-red-600 hover:bg-red-50 text-xs gap-1.5 h-9 font-semibold"
                    >
                      <XCircle className="h-4 w-4" /> Cancelar Pedido
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
