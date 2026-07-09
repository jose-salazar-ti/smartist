import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Smartist",
  description: "Conoce cómo recopilamos, utilizamos y protegemos los datos personales de nuestros clientes conforme a la legislación peruana.",
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ paddingTop: "140px", paddingBottom: "80px" }} className="container mx-auto px-4 max-w-4xl min-h-screen text-slate-800 dark:text-slate-200">
      <div className="space-y-8 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-white/5 shadow-2xl">
        
        {/* Title */}
        <div className="border-b border-slate-200 dark:border-white/10 pb-6">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
            Política de Privacidad
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-mono">
            Última actualización: 20 de Junio, 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            En <strong>Smartist</strong>, valoramos y respetamos la privacidad de nuestros usuarios y clientes. Esta Política de Privacidad describe cómo recopilamos, almacenamos y procesamos la información personal proporcionada al utilizar nuestra plataforma web de sublimación y regalos personalizados, de conformidad con la <strong>Ley N° 29733 (Ley de Protección de Datos Personales de Perú)</strong> y su reglamento.
          </p>

          <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white pt-4">
            1. Información que recopilamos
          </h2>
          <p>
            Recopilamos información únicamente para procesar de forma correcta los pedidos de sublimación y coordinar las entregas. Esto incluye:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li><strong>Datos de contacto:</strong> Nombre completo, dirección de correo electrónico y número de teléfono (WhatsApp).</li>
            <li><strong>Datos de envío:</strong> Dirección física de entrega y distrito de Lima.</li>
            <li><strong>Datos de facturación:</strong> Tipo de comprobante (Boleta o Factura), tipo y número de documento (DNI o RUC) y Razón Social si corresponde.</li>
            <li><strong>Diseños de sublimación:</strong> Archivos de imagen cargados en el personalizador 2D/3D (se almacenan de forma segura en Supabase Storage).</li>
            <li><strong>Capturas de pago (Vouchers):</strong> Imagen del voucher de transferencia Yape o Plin para validar las transacciones.</li>
          </ul>

          <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white pt-4">
            2. Uso de la información
          </h2>
          <p>
            Los datos personales recopilados se utilizan exclusivamente para los siguientes fines:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>Procesar, producir y entregar tus productos personalizados.</li>
            <li>Notificar el estado del pedido a través de correo electrónico o mensajes de WhatsApp.</li>
            <li>Validar los comprobantes de pago de Yape/Plin mediante nuestro panel administrativo.</li>
            <li>Brindar soporte técnico y resolver consultas de los clientes.</li>
          </ul>

          <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white pt-4">
            3. Almacenamiento y Seguridad de los datos
          </h2>
          <p>
            Toda la información y los archivos cargados se almacenan de forma segura utilizando la infraestructura de **Supabase** y la base de datos de producción alojada en la nube. Empleamos medidas de cifrado estándar para proteger el acceso no autorizado a los endpoints de la API del administrador. No almacenamos datos de tarjetas de crédito o débito de forma directa.
          </p>

          <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white pt-4">
            4. Consentimiento y Derechos ARCO
          </h2>
          <p>
            Al utilizar nuestra plataforma y registrar una orden, otorgas tu consentimiento libre e informado para tratar tus datos bajo las condiciones aquí expuestas. Como titular de tus datos personales, puedes ejercer tus derechos de **Acceso, Rectificación, Cancelación y Oposición (Derechos ARCO)** escribiéndonos directamente a nuestro correo de soporte configurado en el panel.
          </p>
        </div>

      </div>
    </div>
  );
}
