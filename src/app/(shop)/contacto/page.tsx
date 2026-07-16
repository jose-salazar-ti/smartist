"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  Loader2, 
  CheckCircle2, 
  MessageSquare
} from "lucide-react";

export default function ContactoPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Settings info loaded dynamically
  const [settings, setSettings] = useState({
    whatsappNumber: "51999999999",
    contactEmail: "hola@smartist.pe",
    address: "Miraflores, Lima, Perú",
    instagramUrl: "https://instagram.com",
    facebookUrl: "https://facebook.com",
    tiktokUrl: "https://tiktok.com"
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Consulta de Pedido",
    message: ""
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/ajustes");
        if (res.ok) {
          const data = await res.json();
          setSettings(prev => ({
            ...prev,
            whatsappNumber: data.whatsappNumber || prev.whatsappNumber,
            contactEmail: data.contactEmail || prev.contactEmail,
            address: data.address || prev.address,
            instagramUrl: data.instagramUrl || prev.instagramUrl,
            facebookUrl: data.facebookUrl || prev.facebookUrl,
            tiktokUrl: data.tiktokUrl || prev.tiktokUrl,
          }));
        }
      } catch (err) {
        console.error("Error loading adjustments in contact page:", err);
      }
    }
    loadSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      toast.error("Por favor completa todos los campos requeridos.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("¡Tu mensaje ha sido enviado! Nos contactaremos pronto.");
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Hubo un error al enviar tu consulta.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al enviar el mensaje.");
    } finally {
      setLoading(false);
    }
  };

  const getFormattedPhone = () => {
    const raw = settings.whatsappNumber;
    if (raw.startsWith("51") && raw.length === 11) {
      return `+51 ${raw.slice(2, 5)} ${raw.slice(5, 8)} ${raw.slice(8)}`;
    }
    return raw;
  };

  return (
    <section style={{ paddingTop: '150px', paddingBottom: '80px', minHeight: '100vh', background: 'radial-gradient(circle at top, var(--bg-dark-2) 0%, var(--bg-dark) 80%)' }}>
      <div className="container max-w-6xl px-4">
      <div className="text-center max-w-2xl mx-auto mb-12 animate-fadeIn">
        <div className="section-label inline-flex mx-auto mb-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          💬 Soporte & Ayuda
        </div>
        <h1 className="font-heading font-bold text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tight">
          ¿Tienes alguna duda? <span className="gradient-text font-extrabold">Contáctanos</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 leading-relaxed">
          Estamos aquí para ayudarte. Completa el formulario de soporte o comunícate directamente con nuestro taller por correo o WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Info Box (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-950/40 backdrop-blur-md p-6 md:p-8 shadow-xl shadow-slate-100/70 dark:shadow-none rounded-2xl">
            <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white mb-6">Información del Taller</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">WhatsApp Soporte</h4>
                  <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block mt-1">
                    {getFormattedPhone()}
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Correo Electrónico</h4>
                  <a href={`mailto:${settings.contactEmail}`} className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block mt-1">
                    {settings.contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 dark:text-sky-400 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Dirección Física</h4>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block mt-1">
                    {settings.address}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Horario de Atención</h4>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 block mt-1">
                    Lunes a Sábado: 9:00 AM - 7:00 PM
                  </span>
                </div>
              </div>
            </div>

            <hr className="my-8 border-slate-100 dark:border-white/[0.08]" />

            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Síguenos en Redes</h4>
              <div className="flex gap-3">
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:border-pink-500 dark:hover:border-pink-500 hover:text-pink-500 transition-colors flex items-center justify-center text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-transparent" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-transparent" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
                  </svg>
                </a>
                <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors flex items-center justify-center text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-transparent" aria-label="TikTok">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.94-1.78-.22-.22-.41-.47-.58-.73v7.02c0 3.74-3.07 6.77-6.81 6.77-3.81.04-7.05-2.98-7.08-6.79C3.99 10.96 7.15 7.78 11 7.82V12c-1.92-.08-3.55 1.43-3.64 3.35-.11 2.19 1.63 3.99 3.82 4.02 2.14.03 3.93-1.63 3.99-3.77V.02z" />
                  </svg>
                </a>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Form (7 Cols) */}
        <div className="lg:col-span-7">
          {success ? (
            <Card className="border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10 backdrop-blur-md p-8 md:p-10 text-center shadow-xl rounded-2xl">
              <CardContent className="pt-6 flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>
                <h3 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">¡Mensaje Enviado con Éxito!</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-md mx-auto">
                  Gracias por contactarnos, <strong>{formData.name}</strong>. Hemos recibido tu consulta sobre <strong>"{formData.subject}"</strong>.
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
                  Un representante de soporte responderá a tu correo <strong>{formData.email}</strong> o te escribirá por WhatsApp en breve.
                </p>
                <Button 
                  onClick={() => {
                    setSuccess(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      subject: "Consulta de Pedido",
                      message: ""
                    });
                  }}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2 rounded-xl transition"
                >
                  Enviar otro mensaje
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-950/40 backdrop-blur-md p-6 md:p-8 shadow-xl shadow-slate-100/70 dark:shadow-none rounded-2xl">
              <CardContent className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="form-group flex flex-col gap-1.5">
                      <Label htmlFor="name" className="text-xs font-bold text-slate-600 dark:text-slate-300">Nombre Completo *</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ej. Carlos Mendoza"
                        className="form-input"
                      />
                    </div>

                    {/* Email */}
                    <div className="form-group flex flex-col gap-1.5">
                      <Label htmlFor="email" className="text-xs font-bold text-slate-600 dark:text-slate-300">Correo Electrónico *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Ej. carlos@correo.com"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div className="form-group flex flex-col gap-1.5">
                      <Label htmlFor="phone" className="text-xs font-bold text-slate-600 dark:text-slate-300">Celular / WhatsApp *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Ej. 999 999 999"
                        className="form-input"
                      />
                    </div>

                    {/* Subject */}
                    <div className="form-group flex flex-col gap-1.5">
                      <Label htmlFor="subject" className="text-xs font-bold text-slate-600 dark:text-slate-300">Asunto de Consulta</Label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="form-input appearance-none w-full"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                      >
                        <option value="Consulta de Pedido">Consulta de Pedido / Tracking</option>
                        <option value="Duda de Personalización">Problema con Diseñador / Fotos</option>
                        <option value="Problema con el Pago">Validación de Transferencia</option>
                        <option value="Sugerencia o Reclamo">Sugerencia o Reclamo</option>
                        <option value="Otros">Otros motivos</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="form-group flex flex-col gap-1.5">
                    <Label htmlFor="message" className="text-xs font-bold text-slate-600 dark:text-slate-300">Mensaje / Detalle de la consulta *</Label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Escribe tu consulta detallada aquí..."
                      className="form-input resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 transition shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 rounded-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Enviando mensaje...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Enviar Mensaje a Soporte
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  </section>
  );
}
