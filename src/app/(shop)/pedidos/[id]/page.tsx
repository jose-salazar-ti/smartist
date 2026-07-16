"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Truck, 
  ShoppingBag,
  RefreshCw,
  Home,
  MessageSquare,
  Star
} from "lucide-react";

interface OrderCustomization {
  userDesignUrl: string;
  details: {
    customText?: string;
    textColor?: string;
    textFont?: string;
    scale?: number;
    x?: number;
    y?: number;
    rotation?: number;
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
      id: string;
      name: string;
    };
  };
  customization?: OrderCustomization | null;
}

interface Order {
  id: string;
  userId?: string | null;
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
}

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("51999999999");

  useEffect(() => {
    async function loadWhatsapp() {
      try {
        const res = await fetch("/api/admin/ajustes");
        if (res.ok) {
          const data = await res.json();
          if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
        }
      } catch (err) {
        console.error("Error loading settings in order details page:", err);
      }
    }
    loadWhatsapp();
  }, []);

  // Reviews states
  const [reviews, setReviews] = useState<any[]>([]);
  const [submittingReview, setSubmittingReview] = useState<Record<string, boolean>>({});
  const [newRatings, setNewRatings] = useState<Record<string, number>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});

  const fetchUserReviews = async (userId: string) => {
    try {
      const res = await fetch(`/api/reviews?usrId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to load user reviews:", err);
    }
  };

  const fetchOrder = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        throw new Error("No se pudo cargar la información del pedido.");
      }
      const data = await res.json();
      setOrder(data);
      if (data.userId) {
        fetchUserReviews(data.userId);
      }
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSubmitReview = async (prodId: string) => {
    const rating = newRatings[prodId] || 5;
    const comment = newComments[prodId] || "";

    setSubmittingReview(prev => ({ ...prev, [prodId]: true }));
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          prodId,
          rating,
          comment
        })
      });
      const data = await res.json();
      if (res.ok) {
        const { toast } = await import("sonner");
        toast.success("¡Gracias! Tu reseña ha sido registrada.");
        if (order?.userId) {
          fetchUserReviews(order.userId);
        }
      } else {
        const { toast } = await import("sonner");
        toast.error(data.error || "No se pudo guardar la reseña.");
      }
    } catch (err) {
      console.error(err);
      const { toast } = await import("sonner");
      toast.error("Error de conexión al enviar la reseña.");
    } finally {
      setSubmittingReview(prev => ({ ...prev, [prodId]: false }));
    }
  };

  // Poll order status every 10 seconds automatically
  useEffect(() => {
    fetchOrder();
    const interval = setInterval(() => {
      fetchOrder();
    }, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ paddingTop: '140px', paddingBottom: '80px' }} className="container mx-auto px-4 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 justify-center">
          <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-medium">Buscando tu pedido en el sistema...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ paddingTop: '140px', paddingBottom: '80px' }} className="container mx-auto px-4 text-center max-w-md">
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="p-8">
            <h2 className="font-heading font-bold text-lg text-slate-900 mb-2">Pedido no encontrado</h2>
            <p className="text-slate-500 text-sm mb-6">
              No pudimos localizar ningún pedido con el identificador proporcionado. Por favor verifica el enlace.
            </p>
            <Link href="/">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                Volver a la Tienda
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Define tracking steps config
  const steps = [
    {
      status: "PENDING",
      title: "Validando Pago",
      description: "Recibimos tu comprobante. Nuestro equipo verificará la transferencia en Yape/Plin.",
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
    },
    {
      status: "PAID",
      title: "Pago Verificado",
      description: "Tu pago fue aprobado con éxito. El producto ha sido agendado para su sublimación.",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
    },
    {
      status: "PROCESSING",
      title: "En Producción",
      description: "Estamos estampando tu diseño personalizado en el taller usando tintas de alta definición.",
      icon: Cpu,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400"
    },
    {
      status: "SHIPPED",
      title: order.pickupMethod === "DELIVERY" ? "Enviado a Domicilio" : "Listo para Recojo",
      description: order.pickupMethod === "DELIVERY" 
        ? "Tu paquete está en manos del motorizado en camino a tu dirección."
        : "Tu producto está listo en taller. Puedes acercarte a recogerlo en Miraflores.",
      icon: order.pickupMethod === "DELIVERY" ? Truck : ShoppingBag,
      color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400"
    }
  ];

  // Find index of current status to highlight timeline progress
  const getStatusIndex = (currentStatus: string) => {
    switch (currentStatus) {
      case "PENDING": return 0;
      case "PAID": return 1;
      case "PROCESSING": return 2;
      case "SHIPPED": return 3;
      default: return 4; // DELIVERED
    }
  };

  const currentStepIndex = getStatusIndex(order.status);

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px' }} className="container mx-auto px-4 sm:px-6 max-w-4xl">
      
      {/* Header and Sync Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
            Seguimiento de Pedido
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <span className="text-xs text-slate-400">
            Realizado el {new Date(order.createdAt).toLocaleDateString("es-PE", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchOrder(true)}
            disabled={refreshing}
            className="border-slate-200 h-9 font-medium gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Link href="/">
            <Button size="sm" className="bg-slate-900 text-white font-medium h-9 gap-1.5">
              <Home className="h-4 w-4" />
              Tienda
            </Button>
          </Link>
        </div>
      </div>

      {/* WhatsApp Confirmation Banner */}
      {order.status === "PENDING" && (
        <div className="mb-6 p-4 bg-linear-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-[0_8px_30px_rgba(5,150,105,0.2)] border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="p-2 bg-white/10 rounded-full shrink-0">
              <MessageSquare className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm">¡Pedido registrado con éxito!</h3>
              <p className="text-[11px] text-emerald-100/90 leading-relaxed mt-0.5">
                Confirma tu orden por WhatsApp para acelerar la validación y comenzar la sublimación de tus productos.
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              `Hola Smartist, acabo de realizar el pedido #${order.id.slice(0, 8).toUpperCase()} en la web. Quedo atento a la confirmación de la producción y los detalles del envío. ¡Muchas gracias!`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 w-full md:w-auto"
          >
            <Button className="w-full md:w-auto bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-bold text-xs h-9 px-5 rounded-xl border-none shadow transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1.5 cursor-pointer">
              💬 Confirmar por WhatsApp
            </Button>
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Timeline Stepper (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950/40 backdrop-blur-md shadow-sm rounded-2xl">
            <CardContent className="p-6 sm:p-8">
              <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-6">
                Estado del Pedido
              </h2>

              {/* TIMELINE STEPPER GRID */}
              <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-zinc-800">
                {steps.map((step, idx) => {
                  const isCompleted = currentStepIndex > idx;
                  const isActive = currentStepIndex === idx;
                  const isPending = currentStepIndex < idx;

                  const StepIcon = step.icon;

                  return (
                    <div key={step.status} className="relative flex gap-4 animate-fadeIn">
                      
                      {/* Circle Indicator */}
                      <span 
                        className={`absolute -left-8 flex h-7.5 w-7.5 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                          isCompleted
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
                            : isActive
                            ? "bg-white border-indigo-600 text-indigo-600 ring-4 ring-indigo-50 dark:bg-zinc-900 dark:ring-indigo-950/40"
                            : "bg-slate-50 border-slate-200 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-4.5 w-4.5" /> : idx + 1}
                      </span>

                      {/* Content Card */}
                      <div className={`grow border p-4 rounded-xl transition-all ${
                        isActive 
                          ? "border-indigo-100 bg-indigo-50/10 dark:border-indigo-950/30" 
                          : "border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50"
                      } ${isPending ? "opacity-60" : ""}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-bold text-sm ${
                            isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-200"
                          }`}>
                            {step.title}
                          </h3>
                          {isActive && (
                            <span className="inline-flex rounded-full bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-500 uppercase tracking-widest animate-pulse">
                              Actual
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                    </div>
                  );
                })}
              </div>

            </CardContent>
          </Card>

          {/* Reviews Card */}
          {order.status === "SHIPPED" && (
            <Card className="border border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950/40 backdrop-blur-md shadow-sm rounded-2xl">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  Califica tus Productos
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Tu pedido ha sido completado. Por favor, califica los productos para ayudarnos a mejorar nuestro servicio.
                </p>

                <div className="space-y-6 divide-y divide-slate-100 dark:divide-zinc-805 dark:divide-zinc-800/60">
                  {order.orderItems.map((item, idx) => {
                    const prodId = item.variant.product.id;
                    const existingReview = reviews.find(r => r.prodId === prodId);
                    const currentRating = newRatings[prodId] || 5;
                    const currentComment = newComments[prodId] || "";
                    const isSubmitting = submittingReview[prodId] || false;

                    return (
                      <div key={item.id} className={`pt-6 ${idx === 0 ? "pt-0" : ""}`}>
                        <div className="flex gap-4">
                          {/* Image */}
                          <div className="h-16 w-16 bg-slate-900 border rounded-xl overflow-hidden shrink-0">
                            <img
                              src={item.customization?.userDesignUrl || "/img/placeholder.png"}
                              alt={item.variant.product.name}
                              className="object-cover h-full w-full"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.getAttribute('data-error')) {
                                  target.setAttribute('data-error', 'true');
                                  target.src = "/img/placeholder.png";
                                }
                              }}
                            />
                          </div>

                          {/* Info */}
                          <div className="grow space-y-1">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                              {item.variant.product.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                              {item.variant.title}
                            </p>

                            {existingReview ? (
                              /* Already reviewed status */
                              <div className="pt-2 space-y-1.5">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= existingReview.calificacion
                                          ? "text-amber-400 fill-amber-400"
                                          : "text-slate-200 dark:text-zinc-800"
                                      }`}
                                    />
                                  ))}
                                  <span className="text-[10px] text-slate-400 font-bold ml-1">Calificado</span>
                                </div>
                                {existingReview.comentario && (
                                  <p className="text-xs text-slate-650 dark:text-zinc-400 italic bg-slate-50 dark:bg-white/2 p-2.5 rounded-lg border border-slate-100 dark:border-white/5">
                                    "{existingReview.comentario}"
                                  </p>
                                )}
                              </div>
                            ) : (
                              /* Review Form */
                              <div className="pt-3 space-y-3">
                                {/* Stars Selection */}
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-slate-500 dark:text-zinc-400 mr-1">Calificación:</span>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setNewRatings(prev => ({ ...prev, [prodId]: star }))}
                                      className="transition-transform hover:scale-125 cursor-pointer"
                                    >
                                      <Star
                                        className={`h-5 w-5 ${
                                          star <= currentRating
                                            ? "text-amber-400 fill-amber-400"
                                            : "text-slate-200 dark:text-zinc-700 hover:text-amber-300"
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>

                                {/* Comment text area */}
                                <div className="space-y-1.5">
                                  <textarea
                                    placeholder="Escribe un comentario sobre el producto (opcional)..."
                                    value={currentComment}
                                    onChange={(e) => setNewComments(prev => ({ ...prev, [prodId]: e.target.value }))}
                                    className="w-full text-xs p-3 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-zinc-900/50 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 text-slate-800 dark:text-white"
                                    rows={2}
                                  />
                                </div>

                                {/* Action button */}
                                <Button
                                  size="sm"
                                  onClick={() => handleSubmitReview(prodId)}
                                  disabled={submittingReview[prodId]}
                                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold h-8 px-4 rounded-lg flex items-center gap-1 cursor-pointer"
                                >
                                  {submittingReview[prodId] ? "Enviando..." : "Enviar Reseña"}
                                </Button>
                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: Detailed specs (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Order Details summary */}
          <Card className="border border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950/40 backdrop-blur-md shadow-sm rounded-2xl">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-heading font-semibold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Detalle del Pedido
              </h3>
              
              <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex gap-2.5 text-xs">
                    <div className="relative h-10 w-10 bg-slate-900 border rounded shrink-0 overflow-hidden">
                      <img
                        src={item.customization?.userDesignUrl || "/img/placeholder.png"}
                        alt={item.variant.product.name}
                        className="object-cover h-full w-full"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.getAttribute('data-error')) {
                            target.setAttribute('data-error', 'true');
                            target.src = "/img/placeholder.png";
                          }
                        }}
                      />
                    </div>
                    <div className="grow flex flex-col justify-center min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                        {item.variant.product.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {item.variant.title} × {item.quantity}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-white self-center">
                      S/. {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <hr />

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">S/. {Number(order.totalAmount - (order.pickupMethod === "DELIVERY" ? 10 : 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Envío</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    S/. {Number(order.pickupMethod === "DELIVERY" ? 10 : 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-950 dark:text-white pt-2 border-t border-slate-100 dark:border-white/10">
                  <span>Monto Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">S/. {Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery & Client details */}
          <Card className="border border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950/40 backdrop-blur-md shadow-sm rounded-2xl">
            <CardContent className="p-5 space-y-4 text-xs">
              <h3 className="font-heading font-semibold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Información de Entrega
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block font-medium">Cliente</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{order.user?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block font-medium">Tipo de entrega</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {order.pickupMethod === "DELIVERY" ? "Envío a Domicilio" : "Recojo en Taller (Miraflores)"}
                  </span>
                </div>
                {order.pickupMethod === "DELIVERY" && (
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-medium">Dirección</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {order.shippingAddress}, {order.shippingDistrict}
                    </span>
                  </div>
                )}
              </div>

              <hr />

              <div className="pt-1">
                <a 
                  href={`https://wa.me/${whatsappNumber}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="outline" className="w-full border-slate-200 h-9 text-xs gap-1.5 font-semibold text-indigo-600 hover:text-indigo-500">
                    <MessageSquare className="h-4.5 w-4.5" />
                    Consultar por WhatsApp
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
