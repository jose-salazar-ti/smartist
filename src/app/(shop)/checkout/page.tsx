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
      
      {/* Fullscreen Loading Overlay con efecto Glassmorphism y resplandor Púrpura */}
      {submitting && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#0d0618]/80 backdrop-blur-xl transition-all duration-500">
          <div className="relative flex flex-col items-center gap-6 bg-gradient-to-b from-[#1c102f] via-[#140b24] to-[#0f071e] border border-purple-500/30 p-8 sm:p-10 rounded-3xl shadow-[0_25px_70px_rgba(147,51,234,0.35)] animate-in fade-in zoom-in duration-300 max-w-md w-full mx-4">
            
            {/* Spinner con anillo brillante en pulso */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
              <div className="relative p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 shadow-inner">
                <Loader2 className="h-10 w-10 text-purple-400 animate-spin" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
                Procesando tu pedido...
              </h3>
              <p className="text-xs text-purple-200/80 leading-relaxed max-w-xs mx-auto">
                Generando vista previa de alta calidad para producción e impresión.
              </p>
              
              <div className="pt-3 flex justify-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-[11px] text-purple-300 font-semibold animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  Guardando comprobante y orden
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/carrito">
          <Button variant="ghost" size="icon" className="text-slate-700 hover:text-purple-700 bg-white hover:bg-purple-50 border border-slate-200 shadow-sm rounded-xl transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="font-heading font-extrabold text-3xl text-slate-900 tracking-tight">
          Completar Compra
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Form inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Datos de Contacto */}
          <Card className="border border-slate-200/90 bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <CardContent className="space-y-4 p-0">
              <h2 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-500/20">1</span>
                Datos del Cliente
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-slate-800 font-bold text-xs uppercase tracking-wider">Nombre Completo</Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="form-input bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-slate-800 font-bold text-xs uppercase tracking-wider">Teléfono (WhatsApp)</Label>
                  <Input
                    id="phone"
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. 999888777"
                    className="form-input bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-800 font-bold text-xs uppercase tracking-wider">Correo Electrónico</Label>
                <Input
                  id="email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej. juan@correo.com"
                  className="form-input bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Método de Entrega */}
          <Card className="border border-slate-200/90 bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <CardContent className="space-y-4 p-0">
              <h2 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-500/20">2</span>
                Método de Entrega
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shippingMethods.map((method) => (
                  <div 
                    key={method.id}
                    onClick={() => setPickupMethod(method.id)}
                    className={`flex flex-col items-center justify-center border p-4 rounded-xl cursor-pointer transition-all ${
                      pickupMethod === method.id
                        ? "border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-sm ring-2 ring-purple-600/20"
                        : "border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-slate-50/80"
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
                    <Label htmlFor="district" className="text-slate-800 font-bold text-xs uppercase tracking-wider">Distrito</Label>
                    <Input
                      id="district"
                      required
                      value={shippingDistrict}
                      onChange={(e) => setShippingDistrict(e.target.value)}
                      placeholder="Ej. Santiago de Surco"
                      className="form-input bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-slate-800 font-bold text-xs uppercase tracking-wider">Dirección Completa</Label>
                    <Input
                      id="address"
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Av. Primavera 123, Dpto 401"
                      className="form-input bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 rounded-xl"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Pago QR Manual */}
          <Card className="border border-slate-200/90 bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <CardContent className="space-y-4 p-0">
              <h2 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-500/20">3</span>
                Pago Manual de tu Pedido
              </h2>

              <div className="space-y-4">
                <Label className="text-slate-800 font-bold text-xs uppercase tracking-wider">Selecciona tu Método de Pago</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`flex flex-col items-center justify-center border p-3 rounded-xl cursor-pointer transition-all text-center ${
                        selectedPaymentMethod === method.id
                          ? "border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-sm ring-2 ring-purple-600/20"
                          : "border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-slate-50/80"
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
                    <div className="flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/60 p-5 rounded-2xl border border-purple-100 w-full shadow-sm">
                      {currentMethod.tipo === "QR" && currentMethod.qrUrl ? (
                        <div className="flex flex-col items-center justify-center bg-white p-2.5 rounded-xl shadow-md border border-purple-100 shrink-0">
                          <div className="relative h-28 w-28 flex items-center justify-center rounded-lg overflow-hidden">
                            <img src={currentMethod.qrUrl} alt={`QR ${currentMethod.nombre}`} className="object-contain h-full w-full" />
                          </div>
                          <span className="text-[10px] font-bold text-purple-700 mt-1.5 uppercase tracking-wider">QR {currentMethod.nombre}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl shadow-md border border-purple-100 shrink-0">
                          <div className="relative h-28 w-28 flex items-center justify-center bg-purple-50 text-purple-600 rounded-lg overflow-hidden">
                            <QrCode className="h-20 w-20 text-purple-600 animate-pulse" />
                          </div>
                          <span className="text-[10px] font-bold text-purple-700 mt-2 uppercase tracking-wider">{currentMethod.nombre}</span>
                        </div>
                      )}

                      <div className="grow space-y-2 text-center md:text-left">
                        <h3 className="font-bold text-sm text-slate-900">Instrucciones para {currentMethod.nombre}</h3>
                        <div className="text-xs text-slate-700 leading-relaxed space-y-2">
                          <p>1. Abre tu aplicación de pago y escanea el código QR o realiza la transferencia.</p>
                          {(currentMethod.numero || currentMethod.titular) && (
                            <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm inline-block text-left w-full sm:w-auto">
                              {currentMethod.numero && (
                                <p>
                                  <strong className="text-purple-700">Número/Cuenta:</strong>{" "}
                                  <span className="font-mono font-extrabold text-slate-900 select-all text-sm">{currentMethod.numero}</span>
                                </p>
                              )}
                              {currentMethod.titular && (
                                <p>
                                  <strong className="text-purple-700">Titular:</strong>{" "}
                                  <span className="text-slate-800 font-semibold">{currentMethod.titular}</span>
                                </p>
                              )}
                            </div>
                          )}
                          <p>2. Envía el monto exacto del total: <span className="font-extrabold text-purple-700 text-sm">S/. {grandTotal.toFixed(2)}</span>.</p>
                          <p>3. Toma una captura de pantalla del voucher y súbela abajo para validar tu orden de inmediato.</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Voucher Upload Area */}
              <div className="space-y-2 pt-2">
                <Label className="text-slate-800 font-bold text-xs uppercase tracking-wider">Subir Comprobante (Captura de Pago)</Label>
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => document.getElementById("voucher-input")?.click()}
                    className="upload-zone relative flex flex-col items-center justify-center p-6 cursor-pointer flex-1 group text-center border-2 border-dashed border-purple-200 hover:border-purple-500 rounded-2xl overflow-hidden transition-all bg-purple-50/30 min-h-[140px]"
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
                        <div className="relative w-full max-w-[180px] h-28 rounded-lg overflow-hidden border border-purple-200 shadow-inner bg-white flex items-center justify-center group-hover:scale-98 transition-transform">
                          <img
                            src={voucherUrl}
                            alt="Comprobante de pago"
                            className="object-contain w-full h-full"
                          />
                          <div className="absolute inset-0 bg-purple-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                            <span className="text-[9px] text-purple-200 font-extrabold uppercase tracking-wide">
                              Clic para cambiar
                            </span>
                          </div>
                        </div>
                        
                        <span className="text-[11px] text-purple-700 font-bold group-hover:underline transition-all mt-1">
                          Haz clic aquí para cambiar comprobante
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <Upload className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform mb-1" />
                        <span className="text-xs font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">
                          Adjuntar Captura del Pago
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">PNG, JPG, JPEG, WEBP o HEIC. Máximo 10MB.</span>
                      </div>
                    )}
                  </div>
                </div>
                {uploadingVoucher && (
                  <div className="text-[11px] text-purple-700 animate-pulse font-bold">Subiendo comprobante al servidor...</div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Side: Order Summary Panel (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="border border-purple-100 bg-white p-6 rounded-2xl shadow-xl shadow-purple-950/5 sticky top-28">
            <h2 className="font-heading font-bold text-xl text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Resumen de Compra
            </h2>

            {/* List of items */}
            <div className="space-y-4 max-h-60 overflow-y-auto mb-6 pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs items-center">
                  <div className="relative h-12 w-12 shrink-0 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <img
                      src={item.customDesignBase64 || item.productImage}
                      alt={item.productName}
                      className="object-cover h-full w-full"
                    />
                  </div>
                  <div className="grow flex flex-col justify-center min-w-0">
                    <h4 className="font-bold text-slate-900 truncate leading-tight">
                      {item.productName}
                    </h4>
                    <span className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.variantTitle} × {item.quantity}
                    </span>
                    {item.customDesignBase64 && (
                      <span className="text-[9px] text-purple-700 font-extrabold mt-0.5">
                        Diseño Personalizado
                      </span>
                    )}
                  </div>
                  <div className="font-extrabold text-slate-900 self-center">
                    S/. {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-slate-100 mb-4" />

            {/* Prices details */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">S/. {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Método de envío</span>
                <span className="font-bold text-slate-900 capitalize">
                  {pickupMethod === "PICKUP" ? "Retiro en Taller" : "Envío a Domicilio"}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Costo de envío</span>
                <span className="font-bold text-slate-900">S/. {deliveryCharge.toFixed(2)}</span>
              </div>
              
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white shadow-md">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-purple-200">Total a Transferir</span>
                  <span className="text-lg font-black text-white">S/. {grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={submitting || uploadingVoucher}
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/25 h-12 rounded-xl text-sm transition-all hover:scale-[1.01] active:scale-[0.99] mt-6 gap-2"
            >
              <ShieldCheck className="h-5 w-5" /> 
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
