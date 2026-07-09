import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Smartist",
  description: "Revisa los términos del servicio, políticas de despacho de pedidos en Lima y condiciones de garantía de productos personalizados.",
};

export default function TermsAndConditionsPage() {
  return (
    <div style={{ paddingTop: "140px", paddingBottom: "80px" }} className="container mx-auto px-4 max-w-4xl min-h-screen text-slate-800 dark:text-slate-200">
      <div className="space-y-8 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-white/5 shadow-2xl">
        
        {/* Title */}
        <div className="border-b border-slate-200 dark:border-white/10 pb-6">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
            Términos y Condiciones
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-mono">
            Última actualización: 20 de Junio, 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            Te damos la bienvenida a la tienda de sublimación y regalos personalizados de <strong>Smartist</strong>. A continuación, se detallan los Términos y Condiciones de uso que rigen las compras y transacciones comerciales efectuadas en nuestra plataforma. Al realizar un pedido, aceptas de forma explícita sujetarte a estas normas.
          </p>

          <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white pt-4">
            1. Políticas de Producción y Personalización
          </h2>
          <p>
            Debido a que nuestros artículos (tazas, mousepads, prendas) son creados bajo demanda con diseños específicos de cada cliente:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>La producción comienza <strong>únicamente tras validar administrativamente el comprobante de pago</strong> de Yape o Plin.</li>
            <li>El cliente es el único responsable de la calidad, resolución y ortografía de los textos e imágenes que carga en el editor 2D/3D.</li>
            <li>Se recomienda subir archivos PNG o JPG de alta calidad para garantizar impresiones nítidas en el sublimado.</li>
          </ul>

          <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white pt-4">
            2. Formas de Pago y Validación
          </h2>
          <p>
            Trabajamos con un sistema de pago manual. El cliente debe realizar la transferencia exacta del total a las cuentas Yape/Plin indicadas en el checkout y cargar la captura del voucher en el formulario. Pedidos cuyos vouchers no sean legibles o contengan datos falsos serán cancelados administrativamente.
          </p>

          <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white pt-4">
            3. Entregas y Plazos de Envío
          </h2>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li><strong>Recojo en taller:</strong> Gratis, previa coordinación, en nuestro punto de entrega de Miraflores.</li>
            <li><strong>Envío a domicilio:</strong> Costo fijo de S/. 10 en distritos seleccionados de Lima Metropolitana. Los despachos se programan en un plazo de 24 a 48 horas laborables tras aprobar el pago.</li>
          </ul>

          <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white pt-4">
            4. Garantía y Devoluciones
          </h2>
          <p>
            Al tratarse de productos personalizados exclusivamente para ti, <strong>no se aceptan cambios ni devoluciones por insatisfacción del diseño</strong> o arrepentimiento de compra una vez iniciada la producción.
          </p>
          <p>
            Únicamente aplicará garantía (reposición del producto o reembolso del dinero) en los siguientes casos excepcionales:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>El producto llegó quebrado o defectuoso físicamente (debe ser reportado en un plazo máximo de 24 horas tras recibirlo).</li>
            <li>Errores de fabricación imputables directamente al taller (ej. sublimar un diseño diferente al enviado por el cliente).</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
