"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, MapPin, ShoppingBag, Award, Sparkles, Loader2, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";

export default function ResellerRegisterForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    city: "",
    storeName: "",
    experience: "No, empiezo de cero",
    businessDetails: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.whatsapp || !formData.city) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/emprendedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("¡Registro de distribuidor enviado!");
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Error al enviar la solicitud.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al enviar el registro.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/10 backdrop-blur-md p-8 text-center max-w-lg mx-auto shadow-xl">
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          <h3 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">¡Registro Recibido!</h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            Hola <strong>{formData.fullName}</strong>, hemos registrado tu solicitud de ingreso al programa de Emprendedores.
          </p>
          <div className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-xs text-slate-700 dark:text-slate-400 text-left w-full space-y-1">
            <p><strong>Tienda:</strong> {formData.storeName || "Por definir"}</p>
            <p><strong>WhatsApp:</strong> {formData.whatsapp}</p>
            <p><strong>Ubicación:</strong> {formData.city}</p>
            <p><strong>Experiencia:</strong> {formData.experience}</p>
          </div>
          <p className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            ✨ Te contactaremos por WhatsApp en los próximos 15 minutos para enviarte tu catálogo de precios y habilitar tu cuenta en el panel.
          </p>
          <Button 
            onClick={() => {
              setSuccess(false);
              setFormData({
                fullName: "",
                email: "",
                whatsapp: "",
                city: "",
                storeName: "",
                experience: "No, empiezo de cero",
                businessDetails: "",
              });
            }}
            className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Registrar otra cuenta
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 dark:border-white/[0.08] bg-white/75 dark:bg-slate-950/40 backdrop-blur-md p-8 md:p-10 max-w-2xl mx-auto shadow-2xl">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">
                <User className="h-4 w-4 text-indigo-400" /> Nombre Completo *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Ej. Juan Pérez"
                required
                className="form-input"
              />
            </div>

            {/* WhatsApp */}
            <div className="form-group">
              <label className="form-label">
                <Phone className="h-4 w-4 text-indigo-400" /> Celular / WhatsApp *
              </label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="Ej. 999 999 999"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* City */}
            <div className="form-group">
              <label className="form-label">
                <MapPin className="h-4 w-4 text-indigo-400" /> Ciudad / Provincia *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Ej. Arequipa"
                required
                className="form-input"
              />
            </div>

            {/* Store Name */}
            <div className="form-group">
              <label className="form-label">
                <ShoppingBag className="h-4 w-4 text-indigo-400" /> Nombre de tu Tienda / Proyecto (Opcional)
              </label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleInputChange}
                placeholder="Ej. Tazas Locas Store"
                className="form-input"
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              <Mail className="h-4 w-4 text-indigo-400" /> Correo Electrónico (Opcional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Ej. mi.correo@ejemplo.com"
              className="form-input"
            />
          </div>

          {/* Experience */}
          <div className="form-group">
            <label className="form-label">
              <Award className="h-4 w-4 text-indigo-400" /> Experiencia en Ventas
            </label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="form-input appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
            >
              <option value="No, empiezo de cero">No, estoy empezando de cero</option>
              <option value="Sí, vendo por redes sociales">Sí, vendo por redes sociales (Instagram/TikTok/FB)</option>
              <option value="Sí, tengo tienda física / taller">Sí, tengo tienda física / taller propio</option>
              <option value="Diseñador independiente">Soy diseñador y quiero vender mis diseños en productos</option>
            </select>
          </div>

          {/* Project Details */}
          <div className="form-group">
            <label className="form-label">
              <Sparkles className="h-4 w-4 text-indigo-400" /> Cuéntanos un poco sobre tu proyecto o marca
            </label>
            <textarea
              name="businessDetails"
              value={formData.businessDetails}
              onChange={handleInputChange}
              rows={3}
              placeholder="Ej. Planeo vender tazas personalizadas con temática anime y memes en mi universidad y por mi cuenta de Instagram."
              className="form-input resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 transition shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Procesando Afiliación...
              </>
            ) : (
              "Unirse al Programa de Emprendedores"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
