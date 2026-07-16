"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Minus, ArrowLeft, CreditCard, Palette, Type } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";

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

export default function CartPage() {
  const router = useRouter();
  
  // Usamos el store de Zustand
  const cart = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const cartTotal = useCartStore((state) => state.getTotal());

  const [isClient, setIsClient] = useState(false);

  // Evitar hydration mismatch de Zustand (localstorage vs SSR)
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 animate-pulse">Cargando tu carrito...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl" style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '80vh' }}>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-indigo-600">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="font-heading font-extrabold text-3xl text-slate-900 dark:text-white">
          Tu Carrito de Compras
        </h1>
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* List of items (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Desktop Table View */}
            <Card className="hidden md:block border border-slate-200 dark:border-white/8 bg-white/50 dark:bg-slate-950/20 backdrop-blur-sm p-0">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="py-4">
                          <div className="flex gap-4">
                            <div 
                              className="relative h-20 w-20 shrink-0 bg-slate-900 rounded-lg overflow-hidden border border-border/40 select-none"
                              onContextMenu={(e) => e.preventDefault()}
                            >
                              <Image
                                src={item.productImage || item.customDesignBase64 || ""}
                                alt={item.productName}
                                fill
                                sizes="(max-width: 768px) 64px, 80px"
                                className="object-cover pointer-events-none select-none"
                                draggable={false}
                                onDragStart={(e) => e.preventDefault()}
                                onContextMenu={(e) => e.preventDefault()}
                              />
                            </div>
                            <div className="flex flex-col justify-center">
                              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                                {item.productName}
                              </h3>
                              <span className="text-xs text-slate-500 capitalize">
                                Opción: {item.variantTitle}
                              </span>
                              
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {item.customDesignBase64 && (
                                  <span className="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950/30 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20">
                                    <Palette className="h-2.5 w-2.5" /> Diseño Personalizado
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="align-middle text-center">
                          <div className="inline-flex items-center border border-border bg-slate-100 dark:bg-slate-950/60 rounded-lg overflow-hidden h-8 mx-auto">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-full rounded-none px-2.5 border-r border-border hover:bg-slate-200 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-xs font-bold text-slate-800 dark:text-slate-200 text-center">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-full rounded-none px-2.5 border-l border-border hover:bg-slate-200 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            S/. {item.price.toFixed(2)} c/u
                          </div>
                        </TableCell>
                        <TableCell className="text-right align-middle font-bold text-slate-950 dark:text-white">
                          S/. {(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell className="align-middle">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Mobile Cards View */}
            <div className="block md:hidden space-y-4">
              {cart.map((item) => (
                <Card key={item.id} className="border border-slate-200 dark:border-white/8 bg-white/50 dark:bg-slate-950/20 backdrop-blur-sm p-4">
                  <div className="flex gap-4">
                    <div 
                      className="relative h-16 w-16 shrink-0 bg-slate-900 rounded-lg overflow-hidden border border-border/40 select-none"
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <Image
                        src={item.productImage || item.customDesignBase64 || ""}
                        alt={item.productName}
                        fill
                        sizes="64px"
                        className="object-cover pointer-events-none select-none"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    </div>
                    <div className="grow">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">
                          {item.productName}
                        </h3>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-red-400 hover:bg-red-950/30 h-7 w-7 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.variantTitle}
                      </div>

                      {/* Customization Details */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.customDesignBase64 && (
                          <span className="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950/30 px-1.5 py-0.5 text-[8px] font-semibold text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20">
                            Diseño Personalizado
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4 border-t pt-3 border-border">
                        <div className="inline-flex items-center border border-border bg-slate-100 dark:bg-slate-950/60 rounded-lg overflow-hidden h-8">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-full rounded-none px-2 border-r border-border hover:bg-slate-200 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-xs font-bold text-slate-800 dark:text-slate-200 text-center">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-full rounded-none px-2 border-l border-border hover:bg-slate-200 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-sm font-extrabold text-slate-950 dark:text-white">
                          S/. {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

          </div>

          {/* Cart Summary Panel (4 Cols) */}
          <div className="lg:col-span-4">
            <Card className="border border-slate-200 dark:border-white/8 bg-white/70 dark:bg-slate-950/40 backdrop-blur-md p-6 shadow-2xl">
              <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-4">
                Resumen del Pedido
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">S/. {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Envío</span>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase">Calculado en Checkout</span>
                </div>
                
                <hr className="my-4 border-border" />
                
                <div className="flex justify-between text-base font-extrabold text-slate-950 dark:text-white">
                  <span>Total estimado</span>
                  <span>S/. {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link href="/checkout" className="block w-full">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/10 h-11 gap-2">
                    <CreditCard className="h-4.5 w-4.5" /> Proceder al Pago
                  </Button>
                </Link>
                <Link href="/" className="block w-full">
                  <Button variant="outline" className="w-full border border-border hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 h-11 transition-colors">
                    Seguir Comprando
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

        </div>
      ) : (
        <Card className="border border-slate-200 dark:border-white/8 bg-white/70 dark:bg-slate-950/40 backdrop-blur-md p-16 text-center max-w-lg mx-auto rounded-2xl shadow-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-400 mx-auto mb-6">
            <Trash2 className="h-6 w-6" />
          </div>
          <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white mb-3">
            Tu carrito está vacío
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed max-w-md mx-auto">
            Aún no has agregado ningún producto personalizable. Explora nuestro catálogo y diseña tu taza, camiseta o mousepad ideal.
          </p>
          <Link href="/productos">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 h-11 shadow-lg shadow-indigo-600/10 rounded-lg">
              Ver Catálogo de Productos
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
