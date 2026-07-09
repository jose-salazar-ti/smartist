"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Package } from "lucide-react";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim().length > 4) {
      router.push(`/pedidos/${orderId.trim()}`);
    }
  };

  return (
    <div style={{ paddingTop: '140px', paddingBottom: '80px' }} className="container mx-auto px-4 sm:px-6 max-w-lg min-h-screen">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500/10 mb-6">
          <Package className="h-8 w-8 text-indigo-400" />
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">
          Rastrear Pedido
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Ingresa el código de tu pedido para conocer su estado de producción y entrega.
        </p>
      </div>

      <Card className="border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-md shadow-2xl shadow-indigo-900/10">
        <CardContent className="p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="orderId" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Código de Pedido
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Ej. d9b2f1..."
                  className="pl-11 h-12 bg-slate-100/60 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 focus-visible:ring-indigo-500"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide"
            >
              Buscar mi pedido
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
