"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, User, Mail, Phone, ShoppingBag, Hash, MessageSquare, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CompanyQuoteForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    productType: "Tazas",
    quantity: "50",
    message: "",
  });
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setSelectedFile(file);
      toast.success(`Logo "${file.name}" cargado temporalmente.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName || !formData.contactName || !formData.email || !formData.phone) {
      toast.error("Por favor completa los campos requeridos.");
      return;
    }

    setLoading(true);

    try {
      let logoUrl = null;

      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);
        uploadData.append("type", "vouchers"); // Reusing Supabase storage bucket

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData
        });
        const uploadJson = await uploadRes.json();
        if (uploadRes.ok && uploadJson.url) {
          logoUrl = uploadJson.url;
        } else {
          toast.warning("El logo no se pudo guardar en el servidor. Se enviará la cotización sin logo.");
        }
      }

      const res = await fetch("/api/cotizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, logoUrl })
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("¡Cotización enviada con éxito!");
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Error al enviar la cotización.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al enviar la cotización.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10 backdrop-blur-md p-8 text-center max-w-lg mx-auto shadow-xl">
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          <h3 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">¡Solicitud Recibida!</h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            Hemos registrado tu requerimiento de <strong>{formData.quantity} {formData.productType}</strong> para <strong>{formData.companyName}</strong>.
          </p>
          <div className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-xs text-slate-700 dark:text-slate-400 text-left w-full space-y-1">
            <p><strong>Contacto:</strong> {formData.contactName}</p>
            <p><strong>WhatsApp:</strong> {formData.phone}</p>
            <p><strong>Correo:</strong> {formData.email}</p>
            {fileName && <p><strong>Logo adjunto:</strong> {fileName}</p>}
          </div>
          <p className="text-indigo-600 dark:text-indigo-300 text-xs font-semibold">
            🚀 Un ejecutivo B2B te enviará la propuesta en PDF vía WhatsApp y correo en menos de 2 horas.
          </p>
          <Button 
            onClick={() => {
              setSuccess(false);
              setFormData({
                companyName: "",
                contactName: "",
                email: "",
                phone: "",
                productType: "Tazas",
                quantity: "50",
                message: "",
              });
              setFileName(null);
            }}
            className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Enviar otra solicitud
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 dark:border-white/8 bg-white/75 dark:bg-slate-950/40 backdrop-blur-md p-8 md:p-10 max-w-2xl mx-auto shadow-2xl">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="form-group">
              <label className="form-label">
                <Building2 className="h-4 w-4 text-indigo-400" /> Razón Social / Empresa *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Ej. TechPeru S.A.C."
                required
                className="form-input"
              />
            </div>

            {/* Contact Name */}
            <div className="form-group">
              <label className="form-label">
                <User className="h-4 w-4 text-indigo-400" /> Nombre del Contacto *
              </label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                placeholder="Ej. María Castillo"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                <Mail className="h-4 w-4 text-indigo-400" /> Correo Corporativo *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Ej. mcastillo@techperu.pe"
                required
                className="form-input"
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">
                <Phone className="h-4 w-4 text-indigo-400" /> Celular / WhatsApp *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Ej. +51 999 999 999"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Type */}
            <div className="form-group">
              <label className="form-label">
                <ShoppingBag className="h-4 w-4 text-indigo-400" /> Producto de Interés
              </label>
              <select
                name="productType"
                value={formData.productType}
                onChange={handleInputChange}
                className="form-input appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
              >
                <option value="Tazas">Tazas Cerámicas</option>
                <option value="Tazas Mágicas">Tazas Mágicas</option>
                <option value="Polos">Polos / Camisetas</option>
                <option value="Mousepads">Mousepads Corporativos</option>
                <option value="Posavasos">Posavasos de Neopreno</option>
                <option value="Pack Mix">Pack Merchandising Combinado</option>
              </select>
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label className="form-label">
                <Hash className="h-4 w-4 text-indigo-400" /> Volumen Estimado (unidades)
              </label>
              <select
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="form-input appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
              >
                <option value="25 - 50">25 a 50 unidades (10% desc.)</option>
                <option value="51 - 100">51 a 100 unidades (15% desc.)</option>
                <option value="101 - 250">101 a 250 unidades (20% desc.)</option>
                <option value="251 - 500">251 a 500 unidades (25% desc.)</option>
                <option value="500+">Más de 500 unidades (30%+ desc.)</option>
              </select>
            </div>
          </div>

          {/* Logo upload (simulation) */}
          <div className="form-group">
            <label className="form-label">
              <Upload className="h-4 w-4 text-indigo-400" /> Adjuntar Logo Corporativo (Opcional)
            </label>
            <div className="upload-zone text-center relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-1.5">
                <Upload className="h-6 w-6 text-slate-500" />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  {fileName ? fileName : "Haz clic para subir tu logo (.PNG, .AI, .PDF)"}
                </span>
                <span className="text-[10px] text-slate-500">Máx. 10MB</span>
              </div>
            </div>
          </div>

          {/* Details / Message */}
          <div className="form-group">
            <label className="form-label">
              <MessageSquare className="h-4 w-4 text-indigo-400" /> Detalles de Personalización / Comentarios
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={3}
              placeholder="Ej. Necesitamos las tazas con fondo interno negro, logo centrado a dos lados. Fecha límite de entrega: 25 de Julio."
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
                <Loader2 className="h-4 w-4 animate-spin" /> Procesando Solicitud...
              </>
            ) : (
              "Solicitar Cotización Mayorista"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
