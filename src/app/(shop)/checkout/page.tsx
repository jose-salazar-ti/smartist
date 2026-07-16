"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Upload, Check, AlertTriangle, ShieldCheck, QrCode, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { uploadCustomDesign } from "@/services/storage";

interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  variantTitle: string;
  price: number;
  quantity: number;
  imageUrl: string;
  customText?: string;
  customTextRight?: string;
  textColor?: string;
  textFont?: string;
  userDesignUrl?: string | null;
  userDesignUrlRight?: string | null;
  designFileName?: string;
  designFileNameRight?: string;
  customizationDetails?: {
    scale: number;
    x: number;
    y: number;
    rotation: number;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  
  // Usamos el store de Zustand
  const cart = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupMethod, setPickupMethod] = useState<string>("PICKUP");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingDistrict, setShippingDistrict] = useState("");

  // Methods fetched dynamically
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("YAPE");

  // Voucher upload state
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherUrl, setVoucherUrl] = useState<string | null>(null);
  const [uploadingVoucher, setUploadingVoucher] = useState(false);

  // Business settings dynamic loading
  const [settings, setSettings] = useState<Record<string, string>>({
    whatsappNumber: "51999999999",
    yapePhone: "999999999",
    yapeOwner: "Smartist S.A.C.",
    plinPhone: "999999999",
    plinOwner: "Smartist S.A.C.",
    yapeQrUrl: "",
    plinQrUrl: ""
  });

  // Evitar hydration mismatch y verificar carrito vacío
  useEffect(() => {
    if (cart.length === 0) {
      // router.push("/"); // Descomentar para producción
    }
    setLoading(false);
  }, [cart.length, router]);

  useEffect(() => {
    async function loadSettingsAndMethods() {
      try {
        const [resSettings, resEnvio, resPago] = await Promise.all([
          fetch("/api/admin/ajustes"),
          fetch("/api/metodos-envio"),
          fetch("/api/metodos-pago")
        ]);

        if (resSettings.ok) {
          const data = await resSettings.json();
          setSettings(prev => ({
            ...prev,
            whatsappNumber: data.whatsappNumber || prev.whatsappNumber,
            yapePhone: data.yapePhone || prev.yapePhone,
            yapeOwner: data.yapeOwner || prev.yapeOwner,
            plinPhone: data.plinPhone || prev.plinPhone,
            plinOwner: data.plinOwner || prev.plinOwner,
            yapeQrUrl: data.yapeQrUrl || prev.yapeQrUrl,
            plinQrUrl: data.plinQrUrl || prev.plinQrUrl,
          }));
        }

        if (resEnvio.ok) {
          const dataEnvio = await resEnvio.json();
          setShippingMethods(dataEnvio);
          if (dataEnvio.length > 0) {
            const hasPickup = dataEnvio.find((m: any) => m.id === "PICKUP");
            setPickupMethod(hasPickup ? "PICKUP" : dataEnvio[0].id);
          }
        }

        if (resPago.ok) {
          const dataPago = await resPago.json();
          setPaymentMethods(dataPago);
          if (dataPago.length > 0) {
            const firstActive = dataPago.find((m: any) => m.id === "YAPE") || dataPago[0];
            setSelectedPaymentMethod(firstActive.id);
          }
        }
      } catch (err) {
        console.error("Error loading adjustments/methods in checkout page:", err);
      }
    }
    loadSettingsAndMethods();
  }, []);
  const handleVoucherChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/") || 
                    file.name.toLowerCase().endsWith(".heic") || 
                    file.name.toLowerCase().endsWith(".heif");

    if (!isImage) {
      toast.error("Por favor, sube una captura de pago en formato de imagen (PNG, JPG, JPEG, HEIC).");
      return;
    }

    setVoucherFile(file);
    setUploadingVoucher(true);

    // Upload voucher to backend
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "vouchers");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setVoucherUrl(data.url);
        toast.success("Captura del comprobante cargada correctamente.");
      } else {
        toast.error(data.error || "Error al cargar la captura. Inténtalo de nuevo.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error en la conexión al cargar el comprobante.");
    } finally {
      setUploadingVoucher(false);
    }
  };

  // Subir diseños desde la memoria RAM (Base64) hacia Supabase Storage
  const uploadDesigns = async (): Promise<any[]> => {
    const uploadedItems = [];
    
    for (const item of cart) {
      const updatedItem = { ...item };
      
      // Si el item tiene un diseño personalizado oculto en memoria
      if (item.customDesignBase64 && item.customDesignBase64.startsWith("data:")) {
        try {
          // Subirlo a Supabase usando el servicio que creamos
          const publicUrl = await uploadCustomDesign(
            item.customDesignBase64,
            `design-${item.id}-${Date.now()}`
          );
          
          // Reemplazar la data gigante por un enlace público
          updatedItem.customDesignBase64 = publicUrl;
        } catch (err) {
          console.error("Failed to upload design for item:", item.id, err);
          throw new Error("No se pudo subir uno de los diseños. Por favor reintenta.");
        }
      }
      
      uploadedItems.push(updatedItem);
    }
    
    return uploadedItems;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone) {
      toast.error("Por favor completa los campos de contacto obligatorio.");
      return;
    }

    if (pickupMethod === "DELIVERY" && (!shippingAddress || !shippingDistrict)) {
      toast.error("Por favor completa los datos de entrega a domicilio.");
      return;
    }

    if (!voucherUrl) {
      toast.error("Es obligatorio adjuntar el comprobante de pago de Yape/Plin para validar tu pedido.");
      return;
    }

    setSubmitting(true);
    
    try {
      // 1. Upload base64 designs to server public URLs
      const finalItems = await uploadDesigns();

      // 2. Submit order payload to backend
      const orderPayload = {
        name,
        email,
        phone,
        pickupMethod,
        shippingAddress: pickupMethod === "DELIVERY" ? shippingAddress : null,
        shippingDistrict: pickupMethod === "DELIVERY" ? shippingDistrict : null,
        voucherUrl,
        items: finalItems,
        metodoPago: selectedPaymentMethod,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (data.success && data.orderId) {
        toast.success("¡Pedido creado con éxito! Esperando validación de pago.", { id: "checkout" });
        
        // Clear cart
        clearCart();
        
        // Redirect to order tracking screen
        router.push(`/pedidos/${data.orderId}`);
      } else {
        toast.error(data.error || "Ocurrió un error al procesar el pedido.", { id: "checkout" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error en la conexión al enviar tu pedido.", { id: "checkout" });
    } finally {
      setSubmitting(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedShipping = shippingMethods.find(m => m.id === pickupMethod);
  const deliveryCharge = selectedShipping ? Number(selectedShipping.costo) : 0.00;
  const grandTotal = cartTotal + deliveryCharge;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 animate-pulse">Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px' }} className="container mx-auto px-4 sm:px-6 max-w-5xl min-h-screen">
      
      {/* Fullscreen Loading Overlay para cuando se está subiendo el diseño */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="flex flex-col items-center gap-5 bg-slate-900 border border-white/10 p-10 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-300">
            <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
            <div className="text-center space-y-1">
              <h3 className="text-xl font-extrabold text-white">Procesando tu pedido...</h3>
              <p className="text-sm text-slate-400">Generando diseño de alta calidad para impresión.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <Link href="/carrito">
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="font-heading font-extrabold text-3xl text-slate-900 dark:text-white">
          Completar Compra
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Form inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Datos de Contacto */}
          <Card className="border border-slate-200 dark:border-white/[0.08] bg-white/70 dark:bg-slate-950/40 backdrop-blur-md shadow-md">
            <CardContent className="space-y-4">
              <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-950 text-indigo-400 text-xs font-bold border border-indigo-500/20">1</span>
                Datos del Cliente
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="form-label">Nombre Completo</Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="form-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="form-label">Teléfono (WhatsApp)</Label>
                  <Input
                    id="phone"
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. 999888777"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="form-label">Correo Electrónico</Label>
                <Input
                  id="email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej. juan@correo.com"
                  className="form-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Método de Entrega */}
          <Card className="border border-slate-200 dark:border-white/[0.08] bg-white/70 dark:bg-slate-950/40 backdrop-blur-md shadow-md">
            <CardContent className="space-y-4">
              <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-950 text-indigo-400 text-xs font-bold border border-indigo-500/20">2</span>
                Método de Entrega
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shippingMethods.map((method) => (
                  <div 
                    key={method.id}
                    onClick={() => setPickupMethod(method.id)}
                    className={`flex flex-col items-center justify-center border p-4 rounded-xl cursor-pointer transition-all ${
                      pickupMethod === method.id
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                        : "border-slate-200 dark:border-white/[0.08] bg-white/50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:border-indigo-500/50 hover:bg-slate-100/50 dark:hover:bg-slate-900/50"
                    }`}
                  >
                    <span className="text-sm font-bold">{method.nombre}</span>
                    {method.tiempoEstimado && (
                      <span className="text-xs text-slate-500 mt-0.5">{method.tiempoEstimado}</span>
                    )}
                  </div>
                ))}
              </div>

              {pickupMethod === "DELIVERY" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 animate-fadeIn">
                  <div className="space-y-1.5">
                    <Label htmlFor="district" className="form-label">Distrito</Label>
                    <Input
                      id="district"
                      required
                      value={shippingDistrict}
                      onChange={(e) => setShippingDistrict(e.target.value)}
                      placeholder="Ej. Santiago de Surco"
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="form-label">Dirección Completa</Label>
                    <Input
                      id="address"
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Av. Primavera 123, Dpto 401"
                      className="form-input"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Pago QR Manual */}
          <Card className="border border-slate-200 dark:border-white/[0.08] bg-white/70 dark:bg-slate-950/40 backdrop-blur-md shadow-md">
            <CardContent className="space-y-4">
              <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-950 text-indigo-400 text-xs font-bold border border-indigo-500/20">3</span>
                Pago Manual de tu Pedido
              </h2>

              <div className="space-y-4">
                <Label className="form-label">Selecciona tu Método de Pago</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`flex flex-col items-center justify-center border p-3 rounded-xl cursor-pointer transition-all text-center ${
                        selectedPaymentMethod === method.id
                          ? "border-indigo-500 bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                          : "border-slate-200 dark:border-white/[0.08] bg-white/50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:border-indigo-500/50 hover:bg-slate-100/50 dark:hover:bg-slate-900/50"
                      }`}
                    >
                      <span className="text-xs font-bold">{method.nombre}</span>
                    </div>
                  ))}
                </div>

                {(() => {
                  const currentMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
                  if (!currentMethod) return null;

                  return (
                    <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-100/60 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200 w-full">
                      {currentMethod.tipo === "QR" && currentMethod.qrUrl ? (
                        <div className="flex flex-col items-center justify-center bg-white p-2 rounded-xl shadow border border-slate-100 shrink-0">
                          <div className="relative h-28 w-28 flex items-center justify-center rounded-lg overflow-hidden">
                            <img src={currentMethod.qrUrl} alt={`QR ${currentMethod.nombre}`} className="object-contain h-full w-full" />
                          </div>
                          <span className="text-[10px] font-bold text-indigo-650 mt-1.5 uppercase tracking-wider">QR {currentMethod.nombre}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl shadow border border-slate-100 shrink-0">
                          <div className="relative h-28 w-28 flex items-center justify-center bg-slate-50 text-slate-600 rounded-lg overflow-hidden">
                            <QrCode className="h-24 w-24 text-indigo-600 animate-pulse" />
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600 mt-2 uppercase tracking-wider">{currentMethod.nombre}</span>
                        </div>
                      )}

                      <div className="grow space-y-2 text-center md:text-left">
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Instrucciones para {currentMethod.nombre}</h3>
                        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
                          <p>1. Abre tu aplicación de pago y escanea el código QR o realiza la transferencia.</p>
                          {(currentMethod.numero || currentMethod.titular) && (
                            <div className="bg-slate-200/50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-300 dark:border-white/5 inline-block text-left w-full sm:w-auto">
                              {currentMethod.numero && (
                                <p>
                                  <strong className="text-indigo-650 dark:text-indigo-400">Número/Cuenta:</strong>{" "}
                                  <span className="font-semibold text-slate-900 dark:text-white select-all">{currentMethod.numero}</span>
                                </p>
                              )}
                              {currentMethod.titular && (
                                <p>
                                  <strong className="text-indigo-650 dark:text-indigo-400">Titular:</strong>{" "}
                                  <span className="text-slate-700 dark:text-slate-300">{currentMethod.titular}</span>
                                </p>
                              )}
                            </div>
                          )}
                          <p>2. Envía el monto exacto del total: <span className="font-bold text-indigo-650 dark:text-indigo-400 text-sm">S/. {grandTotal.toFixed(2)}</span>.</p>
                          <p>3. Toma una captura de pantalla del voucher y súbela abajo para validar tu orden de inmediato.</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Voucher Upload Area */}
              <div className="space-y-2 pt-2">
                <Label className="form-label">Subir Comprobante (Captura de Pago)</Label>
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => document.getElementById("voucher-input")?.click()}
                    className="upload-zone relative flex flex-col items-center justify-center p-6 cursor-pointer flex-1 group text-center border-2 border-dashed border-slate-200 dark:border-white/20 hover:border-indigo-500/50 rounded-2xl overflow-hidden transition-all bg-slate-50 dark:bg-slate-900/40 min-h-[140px]"
                  >
                    <input
                      id="voucher-input"
                      type="file"
                      accept="image/*"
                      onChange={handleVoucherChange}
                      className="hidden"
                    />
                    
                    {voucherUrl ? (
                      <div className="w-full flex flex-col items-center justify-center gap-2">
                        {/* Check badge */}
                        <div className="absolute top-3 right-3 bg-emerald-600 text-white rounded-full p-1 shadow-md z-20">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        
                        {/* Image preview */}
                        <div className="relative w-full max-w-[180px] h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner bg-slate-100 dark:bg-slate-950/80 flex items-center justify-center group-hover:scale-98 transition-transform">
                          <img
                            src={voucherUrl}
                            alt="Comprobante de pago"
                            className="object-contain w-full h-full"
                          />
                          <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                            <span className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-wide">
                              Clic para cambiar
                            </span>
                          </div>
                        </div>
                        
                        <span className="text-[10px] text-indigo-650 dark:text-indigo-450 font-semibold group-hover:underline transition-all mt-1">
                          Haz clic aquí para cambiar comprobante
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <Upload className="h-5 w-5 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform mb-1" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-500 dark:group-hover:text-indigo-455 transition-colors">
                          Adjuntar Captura del Pago
                        </span>
                        <span className="text-[10px] text-slate-500">PNG, JPG, JPEG, WEBP o HEIC. Máximo 10MB.</span>
                      </div>
                    )}
                  </div>
                </div>
                {uploadingVoucher && (
                  <div className="text-[10px] text-indigo-400 animate-pulse font-medium">Subiendo comprobante al servidor...</div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Side: Order Summary Panel (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="border border-slate-200 dark:border-white/[0.08] bg-white/70 dark:bg-slate-950/40 backdrop-blur-md p-6 sticky top-28 shadow-lg dark:shadow-black/30 animate-fadeIn">
            <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-4">
              Resumen de Compra
            </h2>

            {/* List of items */}
            <div className="space-y-4 max-h-60 overflow-y-auto mb-6 pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs">
                  <div className="relative h-12 w-12 shrink-0 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded overflow-hidden">
                    <img
                      src={item.customDesignBase64 || item.productImage}
                      alt={item.productName}
                      className="object-cover h-full w-full"
                    />
                  </div>
                  <div className="grow flex flex-col justify-center min-w-0">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                      {item.productName}
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.variantTitle} × {item.quantity}
                    </span>
                    {item.customDesignBase64 && (
                      <span className="text-[9px] text-indigo-650 dark:text-indigo-400 font-semibold mt-0.5">
                        Diseño Personalizado
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white self-center">
                    S/. {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-slate-200 dark:border-white/[0.08] mb-4" />

            {/* Prices details */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">S/. {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Método de envío</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {pickupMethod === "PICKUP" ? "Retiro en Taller" : "Envío a Domicilio"}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Costo de envío</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">S/. {deliveryCharge.toFixed(2)}</span>
              </div>
              
              <hr className="border-slate-200 dark:border-white/[0.08] my-3" />
              
              <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white">
                <span>Total a Transferir</span>
                <span className="text-base text-indigo-600 dark:text-indigo-400">S/. {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={submitting || uploadingVoucher}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/10 h-11 mt-6 gap-2"
            >
              <ShieldCheck className="h-4.5 w-4.5" /> 
              {submitting ? "Creando Pedido..." : "Finalizar Pedido y Enviar Comprobante"}
            </Button>
            
            <p className="text-[10px] text-slate-500 mt-3 text-center leading-relaxed">
              Al hacer click, procesaremos tu diseño y crearemos tu orden. La producción comenzará de inmediato tras la validación administrativa de tu Yape/Plin.
            </p>
          </Card>
        </div>

      </form>
    </div>
  );
}
