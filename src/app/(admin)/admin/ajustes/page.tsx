"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Save, 
  Loader2, 
  MessageCircle, 
  Mail, 
  Phone, 
  DollarSign, 
  Upload, 
  Globe, 
  Share2, 
  Smartphone,
  Store,
  MapPin
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Business settings state
  const [businessName, setBusinessName] = useState("Smartist");
  const [whatsappNumber, setWhatsappNumber] = useState("51999999999");
  const [contactEmail, setContactEmail] = useState("contacto@smartist.pe");
  const [address, setAddress] = useState("Miraflores, Lima");
  


  // Social Links
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");



  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/ajustes");
        if (res.ok) {
          const data = await res.json();
          if (data.businessName) setBusinessName(data.businessName);
          if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
          if (data.contactEmail) setContactEmail(data.contactEmail);
          if (data.address) setAddress(data.address);
          


          if (data.instagramUrl) setInstagramUrl(data.instagramUrl);
          if (data.facebookUrl) setFacebookUrl(data.facebookUrl);
          if (data.tiktokUrl) setTiktokUrl(data.tiktokUrl);
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        toast.error("No se pudieron cargar los ajustes del negocio.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Guardando ajustes...");

    const payload = {
      businessName,
      whatsappNumber,
      contactEmail,
      address,
      instagramUrl,
      facebookUrl,
      tiktokUrl
    };

    try {
      const res = await fetch("/api/admin/ajustes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Ajustes del negocio guardados correctamente.", { id: toastId });
      } else {
        toast.error("Error al guardar los ajustes.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de red al guardar los ajustes.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Title */}
      <div>
        <h1 className="font-heading font-extrabold text-3xl text-slate-900 dark:text-white mb-1">
          Ajustes del Negocio
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Configura los datos de contacto, enlaces de redes sociales y cuentas para pagos de Yape/Plin.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Card 1: Información General */}
        <Card className="border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-2xl shadow-xl">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="h-5 w-5 text-indigo-500" />
              Información General de la Tienda
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="businessName">Nombre del Negocio</Label>
                <Input 
                  id="businessName" 
                  value={businessName} 
                  onChange={(e) => setBusinessName(e.target.value)} 
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactEmail" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> Correo de Contacto
                </Label>
                <Input 
                  id="contactEmail" 
                  type="email" 
                  value={contactEmail} 
                  onChange={(e) => setContactEmail(e.target.value)} 
                  className="rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="whatsappNumber" className="flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-500" /> Celular WhatsApp (Con código, ej. 51999999999)
                </Label>
                <Input 
                  id="whatsappNumber" 
                  value={whatsappNumber} 
                  onChange={(e) => setWhatsappNumber(e.target.value)} 
                  className="rounded-xl"
                  placeholder="51999999999"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> Dirección de Taller / Tienda
                </Label>
                <Input 
                  id="address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  className="rounded-xl"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Card 3: Redes Sociales */}
        <Card className="border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-2xl shadow-xl">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-indigo-505 text-indigo-500" />
              Enlaces de Redes Sociales
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="instagramUrl" className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-pink-500" /> Instagram URL
                </Label>
                <Input 
                  id="instagramUrl" 
                  value={instagramUrl} 
                  onChange={(e) => setInstagramUrl(e.target.value)} 
                  className="rounded-xl"
                  placeholder="https://instagram.com/smartist"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="facebookUrl" className="flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5 text-blue-600" /> Facebook URL
                </Label>
                <Input 
                  id="facebookUrl" 
                  value={facebookUrl} 
                  onChange={(e) => setFacebookUrl(e.target.value)} 
                  className="rounded-xl"
                  placeholder="https://facebook.com/smartist"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tiktokUrl" className="flex items-center gap-1.5">
                  {/* Custom TikTok Style Icon */}
                  <span className="font-bold text-xs text-rose-500">Tt</span> TikTok URL
                </Label>
                <Input 
                  id="tiktokUrl" 
                  value={tiktokUrl} 
                  onChange={(e) => setTiktokUrl(e.target.value)} 
                  className="rounded-xl"
                  placeholder="https://tiktok.com/@smartist"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 px-6 h-11 shadow-lg shadow-indigo-600/20 rounded-xl cursor-pointer"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4.5 w-4.5" />}
            Guardar Cambios
          </Button>
        </div>

      </form>
    </div>
  );
}
