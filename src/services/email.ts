import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

// Inicializa Resend si la API key existe, de lo contrario usaremos modo de pruebas/logs en consola.
const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface EmailOrderDetails {
  orderId: string;
  customerName: string;
  total: number;
  pickupMethod: string;
  items: Array<{
    name: string;
    variantTitle: string;
    quantity: number;
    price: number;
  }>;
}

export async function sendOrderConfirmationEmail(to: string, details: EmailOrderDetails) {
  const { orderId, customerName, total, pickupMethod, items } = details;
  const shortId = orderId.slice(0, 8).toUpperCase();
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pedidos/${orderId}`;

  const itemsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; font-size: 14px; color: #1e293b;">
          <strong>${item.name}</strong><br/>
          <span style="font-size: 12px; color: #64748b;">${item.variantTitle}</span>
        </td>
        <td style="padding: 12px 0; font-size: 14px; color: #1e293b; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; font-size: 14px; color: #1e293b; text-align: right; font-weight: bold;">
          S/. ${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Pedido - Smartist</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 24px 0;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <!-- Header Gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">¡Gracias por tu pedido!</h1>
                  <p style="color: #c084fc; margin: 8px 0 0 0; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Orden #${shortId}</p>
                </td>
              </tr>
              <!-- Body Content -->
              <tr>
                <td style="padding: 32px 24px;">
                  <p style="font-size: 16px; color: #334155; margin: 0 0 20px 0; line-height: 1.6;">
                    Hola <strong>${customerName}</strong>,
                  </p>
                  <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0; line-height: 1.6;">
                    Hemos recibido tu pedido correctamente. Actualmente se encuentra en estado de <strong>Validación de Pago</strong>. Verificaremos el comprobante adjunto a la brevedad para comenzar la producción en el taller.
                  </p>

                  <!-- Order Summary Table -->
                  <h3 style="font-size: 14px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin: 0 0 12px 0;">Resumen del Pedido</h3>
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <thead>
                      <tr style="border-bottom: 1px solid #e2e8f0;">
                        <th align="left" style="padding: 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase;">Producto</th>
                        <th align="center" style="padding: 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase;">Cant</th>
                        <th align="right" style="padding: 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase;">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="2" style="padding: 16px 0 8px 0; font-size: 14px; color: #475569;">Método de Entrega:</td>
                        <td align="right" style="padding: 16px 0 8px 0; font-size: 14px; color: #1e293b; font-weight: bold; text-transform: capitalize;">
                          ${pickupMethod === "DELIVERY" ? "Envío a Domicilio" : "Recojo en Tienda"}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 8px 0; font-size: 16px; color: #0f172a; font-weight: bold;">Monto Total a Transferir:</td>
                        <td align="right" style="padding: 8px 0; font-size: 18px; color: #4f46e5; font-weight: 800;">
                          S/. ${total.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  <!-- Track Order Button -->
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 32px; text-align: center;">
                    <tr>
                      <td>
                        <a href="${trackingUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 10px rgba(79,70,229,0.25);">
                          Rastrear mi Pedido en Tiempo Real
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Footer Info -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; font-size: 12px; color: #64748b;">
                  <p style="margin: 0 0 8px 0; font-weight: bold;">Smartist Sublimación & Regalos</p>
                  <p style="margin: 0;">Lima, Perú. ¿Tienes dudas? Consúltanos directamente por WhatsApp.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (resend) {
    try {
      const fromEmail = "Smartist <onboarding@resend.dev>"; // Cambiar a dominio verificado en prod
      const recipient = fromEmail.includes("onboarding@resend.dev") ? "joseluissalazarmeza1@gmail.com" : to;
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [recipient],
        subject: `Confirmación de Pedido #${shortId} - Smartist`,
        html: emailHtml,
      });

      if (error) {
        console.error("Resend email sending error:", error);
      } else {
        console.log("Confirmation email sent successfully via Resend:", data?.id);
      }
    } catch (err) {
      console.error("Resend email sending connection error:", err);
    }
  } else {
    console.log("----- MOCK EMAIL CONFIRMATION -----");
    console.log(`To: ${to}`);
    console.log(`Subject: Confirmación de Pedido #${shortId}`);
    console.log(`Tracking Link: ${trackingUrl}`);
    console.log("-----------------------------------");
  }
}

export async function sendCompanyQuoteEmail(
  to: string,
  details: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    productType: string;
    quantity: string;
    message: string;
    logoUrl?: string | null;
  }
) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nueva Solicitud de Cotización Corporativa</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 0;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <!-- Premium Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 36px 32px; text-align: center;">
                  <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 6px;">
                    Smart<span style="color: #c084fc;">ist</span>
                  </div>
                  <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">Nueva Cotización Corporativa</h1>
                  <p style="color: #a5b4fc; margin: 6px 0 0 0; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 1.5px;">B2B - Mayorista</p>
                </td>
              </tr>
              <!-- Email Body -->
              <tr>
                <td style="padding: 36px 32px; color: #334155; line-height: 1.6;">
                  <p style="font-size: 15px; margin-top: 0; color: #475569;">Se ha recibido una nueva solicitud de cotización para empresas en el portal:</p>
                  
                  <table width="100%" border="0" cellpadding="12" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 24px 0;">
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td width="35%" style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 6px;">Razón Social:</td>
                      <td style="font-size: 14px; color: #0f172a; font-weight: bold; padding-bottom: 6px;">${details.companyName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 12px; padding-bottom: 6px;">Contacto:</td>
                      <td style="font-size: 14px; color: #0f172a; padding-top: 12px; padding-bottom: 6px;">${details.contactName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 12px; padding-bottom: 6px;">Correo:</td>
                      <td style="font-size: 14px; padding-top: 12px; padding-bottom: 6px;"><a href="mailto:${details.email}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">${details.email}</a></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 12px; padding-bottom: 6px;">WhatsApp:</td>
                      <td style="font-size: 14px; padding-top: 12px; padding-bottom: 6px;">
                        <a href="https://wa.me/${details.phone.replace(/[^0-9]/g, '')}" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 6px 14px; border-radius: 99px; text-decoration: none; font-weight: bold; font-size: 12px; box-shadow: 0 2px 5px rgba(37,211,102,0.15);">
                          💬 Chatear (${details.phone})
                        </a>
                      </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 12px; padding-bottom: 6px;">Producto:</td>
                      <td style="font-size: 14px; color: #0f172a; padding-top: 12px; padding-bottom: 6px;">${details.productType}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 12px; padding-bottom: 6px;">Cantidad:</td>
                      <td style="font-size: 14px; color: #0f172a; font-weight: bold; padding-top: 12px; padding-bottom: 6px;">${details.quantity} unidades</td>
                    </tr>
                    ${details.logoUrl ? `
                    <tr>
                      <td style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 12px;">Logo Adjunto:</td>
                      <td style="font-size: 14px; padding-top: 12px;">
                        <a href="${details.logoUrl}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 6px 14px; border-radius: 99px; text-decoration: none; font-weight: bold; font-size: 12px; box-shadow: 0 2px 5px rgba(79,70,229,0.15);">
                          📂 Descargar Logo
                        </a>
                      </td>
                    </tr>
                    ` : ""}
                  </table>
 
                  <h3 style="font-size: 14px; color: #0f172a; margin-top: 32px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Detalles / Comentarios adicionales</h3>
                  <p style="font-size: 14px; background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #6366f1; font-style: italic; color: #475569; margin: 12px 0 0 0; line-height: 1.6;">
                    "${details.message || "Sin comentarios adicionales."}"
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; font-size: 12px; color: #64748b;">
                  <p style="margin: 0; font-weight: 500;">Smartist CRM Corporativo — Lima, Perú</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (resend) {
    try {
      const fromEmail = "Smartist Cotizaciones <onboarding@resend.dev>";
      const recipient = fromEmail.includes("onboarding@resend.dev") ? "joseluissalazarmeza1@gmail.com" : to;
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [recipient],
        subject: `Nueva Cotización Corporativa - ${details.companyName}`,
        html: emailHtml,
      });
      if (error) {
        console.error("Resend quote email error:", error);
      } else {
        console.log("Quote email sent successfully:", data?.id);
      }
    } catch (err) {
      console.error("Error sending quote email via Resend:", err);
    }
  } else {
    console.log("----- MOCK COMPANY QUOTE EMAIL -----");
    console.log(`To: ${to}`);
    console.log(`Company: ${details.companyName}`);
    console.log(`Quantity: ${details.quantity} x ${details.productType}`);
    console.log("-----------------------------------");
  }
}

export async function sendResellerApplicationEmail(
  to: string,
  details: {
    fullName: string;
    whatsapp: string;
    city: string;
    storeName?: string;
    experience: string;
    businessDetails: string;
  }
) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nueva Solicitud de Emprendedor / Dropshipping</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 0;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <!-- Premium Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 36px 32px; text-align: center;">
                  <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 6px;">
                    Smart<span style="color: #c084fc;">ist</span>
                  </div>
                  <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">Nueva Solicitud de Emprendedor</h1>
                  <p style="color: #c084fc; margin: 6px 0 0 0; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 1.5px;">Dropshipping / Distribuidor</p>
                </td>
              </tr>
              <!-- Email Body -->
              <tr>
                <td style="padding: 36px 32px; color: #334155; line-height: 1.6;">
                  <p style="font-size: 15px; margin-top: 0; color: #475569;">Un nuevo emprendedor desea afiliarse al sistema de distribución:</p>
                  
                  <table width="100%" border="0" cellpadding="12" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 24px 0;">
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td width="35%" style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 6px;">Emprendedor:</td>
                      <td style="font-size: 14px; color: #0f172a; font-weight: bold; padding-bottom: 6px;">${details.fullName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 12px; padding-bottom: 6px;">WhatsApp:</td>
                      <td style="font-size: 14px; padding-top: 12px; padding-bottom: 6px;">
                        <a href="https://wa.me/${details.whatsapp.replace(/[^0-9]/g, '')}" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 6px 14px; border-radius: 99px; text-decoration: none; font-weight: bold; font-size: 12px; box-shadow: 0 2px 5px rgba(37,211,102,0.15);">
                          💬 Chatear (${details.whatsapp})
                        </a>
                      </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 12px; padding-bottom: 6px;">Ciudad / Región:</td>
                      <td style="font-size: 14px; color: #0f172a; padding-top: 12px; padding-bottom: 6px;">${details.city}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 12px; padding-bottom: 6px;">Nombre de Tienda:</td>
                      <td style="font-size: 14px; color: #0f172a; padding-top: 12px; padding-bottom: 6px;">${details.storeName || "Ninguno / Por definir"}</td>
                    </tr>
                    <tr>
                      <td style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 12px;">Experiencia:</td>
                      <td style="font-size: 14px; color: #0f172a; padding-top: 12px;">${details.experience}</td>
                    </tr>
                  </table>
 
                  <h3 style="font-size: 14px; color: #0f172a; margin-top: 32px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Detalles sobre su marca o proyecto</h3>
                  <p style="font-size: 14px; background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #4f46e5; font-style: italic; color: #475569; margin: 12px 0 0 0; line-height: 1.6;">
                    "${details.businessDetails || "Sin comentarios adicionales."}"
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; font-size: 12px; color: #64748b;">
                  <p style="margin: 0; font-weight: 500;">Smartist CRM Emprendedores — Lima, Perú</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (resend) {
    try {
      const fromEmail = "Smartist Emprendedores <onboarding@resend.dev>";
      const recipient = fromEmail.includes("onboarding@resend.dev") ? "joseluissalazarmeza1@gmail.com" : to;
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [recipient],
        subject: `Nueva Solicitud de Distribuidor - ${details.fullName}`,
        html: emailHtml,
      });
      if (error) {
        console.error("Resend reseller email error:", error);
      } else {
        console.log("Reseller email sent successfully:", data?.id);
      }
    } catch (err) {
      console.error("Error sending reseller application email via Resend:", err);
    }
  } else {
    console.log("----- MOCK RESELLER APPLICATION EMAIL -----");
    console.log(`To: ${to}`);
    console.log(`Name: ${details.fullName}`);
    console.log(`WhatsApp: ${details.whatsapp}`);
    console.log("-------------------------------------------");
  }
}

export async function sendContactFormEmail(
  to: string,
  details: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }
) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nueva Consulta de Contacto / Ayuda</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 0;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <!-- Premium Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 36px 32px; text-align: center;">
                  <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 6px;">
                    Smart<span style="color: #c084fc;">ist</span>
                  </div>
                  <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">Nueva Consulta de Soporte</h1>
                  <p style="color: #e0f2fe; margin: 6px 0 0 0; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 1.5px;">Contacto / Ayuda</p>
                </td>
              </tr>
              <!-- Email Body -->
              <tr>
                <td style="padding: 36px 32px; color: #334155; line-height: 1.6;">
                  <p style="font-size: 15px; margin-top: 0; color: #475569;">Se ha recibido una nueva consulta a través del formulario de contacto público:</p>
                  
                  <table width="100%" border="0" cellpadding="12" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 24px 0;">
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td width="35%" style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 6px;">Nombre:</td>
                      <td style="font-size: 14px; color: #0f172a; font-weight: bold; padding-bottom: 6px;">${details.name}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 12px; padding-bottom: 6px;">Correo:</td>
                      <td style="font-size: 14px; padding-top: 12px; padding-bottom: 6px;"><a href="mailto:${details.email}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${details.email}</a></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 12px; padding-bottom: 6px;">WhatsApp:</td>
                      <td style="font-size: 14px; padding-top: 12px; padding-bottom: 6px;">
                        <a href="https://wa.me/${details.phone.replace(/[^0-9]/g, '')}" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 6px 14px; border-radius: 99px; text-decoration: none; font-weight: bold; font-size: 12px; box-shadow: 0 2px 5px rgba(37,211,102,0.15);">
                          💬 Chatear (${details.phone})
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 12px;">Asunto:</td>
                      <td style="font-size: 14px; font-weight: bold; color: #0284c7; padding-top: 12px;">${details.subject}</td>
                    </tr>
                  </table>
 
                  <h3 style="font-size: 14px; color: #0f172a; margin-top: 32px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Mensaje / Consulta</h3>
                  <p style="font-size: 14px; background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #0284c7; color: #475569; margin: 12px 0 0 0; line-height: 1.6;">
                    "${details.message}"
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; font-size: 12px; color: #64748b;">
                  <p style="margin: 0; font-weight: 500;">Smartist Soporte — Lima, Perú</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (resend) {
    try {
      const fromEmail = "Smartist Soporte <onboarding@resend.dev>";
      const recipient = fromEmail.includes("onboarding@resend.dev") ? "joseluissalazarmeza1@gmail.com" : to;
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [recipient],
        subject: `[Soporte] ${details.subject} - ${details.name}`,
        html: emailHtml,
      });
      if (error) {
        console.error("Resend contact support email error:", error);
      } else {
        console.log("Contact support email sent successfully:", data?.id);
      }
    } catch (err) {
      console.error("Error sending contact support email via Resend:", err);
    }
  } else {
    console.log("----- MOCK SUPPORT CONTACT EMAIL -----");
    console.log(`To: ${to}`);
    console.log(`Subject: ${details.subject}`);
    console.log(`From: ${details.name} (${details.email})`);
    console.log("--------------------------------------");
  }
}

export async function sendOrderStatusUpdateEmail(
  to: string,
  details: {
    orderId: string;
    customerName: string;
    statusName: string;
    statusColor?: string;
    emailTitulo?: string | null;
    emailDescripcion?: string | null;
    total: number;
    statusId?: string;
  }
) {
  const { orderId, customerName, statusName, statusColor, emailTitulo, emailDescripcion, total, statusId } = details;
  const shortId = orderId.slice(0, 8).toUpperCase();
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pedidos/${orderId}`;

  const statusTitle = emailTitulo || `Actualización de tu pedido: ${statusName}`;
  const statusDescription = emailDescripcion || `El estado de tu pedido ha cambiado a: ${statusName}.`;

  const colorMap: Record<string, string> = {
    amber: "#d97706",
    emerald: "#059669",
    indigo: "#4f46e5",
    sky: "#2563eb",
    rose: "#dc2626"
  };
  const statusBadgeColor = colorMap[statusColor || ""] || "#4f46e5";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Actualización de Pedido - Smartist</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 24px 0;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <!-- Header Gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Estado de tu Pedido</h1>
                  <p style="color: #c084fc; margin: 8px 0 0 0; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Orden #${shortId}</p>
                </td>
              </tr>
              <!-- Body Content -->
              <tr>
                <td style="padding: 32px 24px;">
                  <p style="font-size: 16px; color: #334155; margin: 0 0 20px 0; line-height: 1.6;">
                    Hola <strong>${customerName}</strong>,
                  </p>
                  <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px 0; line-height: 1.6;">
                    Te escribimos para informarte que el estado de tu pedido ha sido actualizado:
                  </p>

                  <!-- Status Banner -->
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 5px solid ${statusBadgeColor}; border-radius: 10px; padding: 20px; margin: 24px 0;">
                    <div style="font-size: 16px; font-weight: bold; color: ${statusBadgeColor}; margin-bottom: 8px;">
                      ${statusTitle}
                    </div>
                    <div style="font-size: 14px; color: #475569; line-height: 1.6;">
                      ${statusDescription}
                    </div>
                  </div>

                  <!-- Optional Dedication Promo Section for PAID orders -->
                  ${statusId === "PAID" ? `
                  <div style="background: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%); border: 1px solid #fecdd3; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0 32px 0;">
                    <div style="font-size: 24px; margin-bottom: 8px;">🎁</div>
                    <h3 style="color: #be123c; margin: 0 0 8px 0; font-size: 15px; font-weight: bold;">¿Tu pedido es para un regalo?</h3>
                    <p style="color: #4c0519; margin: 0 0 16px 0; font-size: 13px; line-height: 1.5;">
                      Crea un enlace con una <strong>dedicatoria digital interactiva</strong> gratis. Puedes incluir fotos, tu mensaje y una canción especial de Spotify para sorprender al destinatario en su celular.
                    </p>
                    <a href="${trackingUrl.replace('/pedidos/', '/regalos/crear?orderId=')}" target="_blank" style="background-color: #be123c; color: #ffffff; padding: 12px 24px; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 8px rgba(190,18,60,0.15);">
                      Diseñar Dedicatoria Digital Gratis
                    </a>
                  </div>
                  ` : ""}

                  <p style="font-size: 14px; color: #475569; margin: 24px 0 32px 0; line-height: 1.6;">
                    Puedes hacer clic en el botón de abajo en cualquier momento para ver los detalles de tu pedido, el comprobante y el seguimiento del estado en tiempo real.
                  </p>

                  <!-- Track Order Button -->
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="text-align: center; margin-bottom: 24px;">
                    <tr>
                      <td>
                        <a href="${trackingUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 10px rgba(79,70,229,0.25);">
                          Ver Seguimiento del Pedido
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Footer Info -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; font-size: 12px; color: #64748b;">
                  <p style="margin: 0 0 8px 0; font-weight: bold;">Smartist Sublimación & Regalos</p>
                  <p style="margin: 0;">Lima, Perú. ¿Tienes alguna consulta? Escríbenos directamente por WhatsApp.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (resend) {
    try {
      const fromEmail = "Smartist <onboarding@resend.dev>";
      const recipient = fromEmail.includes("onboarding@resend.dev") ? "joseluissalazarmeza1@gmail.com" : to;
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [recipient],
        subject: `Actualización de Pedido #${shortId} - Smartist`,
        html: emailHtml,
      });

      if (error) {
        console.error("Resend status email sending error:", error);
      } else {
        console.log("Status update email sent successfully via Resend:", data?.id);
      }
    } catch (err) {
      console.error("Resend status email connection error:", err);
    }
  } else {
    console.log("----- MOCK EMAIL STATUS UPDATE -----");
    console.log(`To: ${to}`);
    console.log(`Subject: Actualización de Pedido #${shortId}`);
    console.log(`Status: ${statusName} (${statusTitle})`);
    console.log(`Tracking Link: ${trackingUrl}`);
    console.log("-------------------------------------");
  }
}

export async function sendContactReplyEmail(
  to: string,
  details: {
    name: string;
    subject: string;
    originalMessage: string;
    replyMessage: string;
  }
) {
  const { name, subject, originalMessage, replyMessage } = details;
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Respuesta a tu consulta - Smartist</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 24px 0;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 32px 24px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Respuesta a tu consulta</h1>
                  <p style="color: #c084fc; margin: 6px 0 0 0; font-size: 13px; font-weight: bold; text-transform: uppercase;">Smartist Soporte</p>
                </td>
              </tr>
              <!-- Body Content -->
              <tr>
                <td style="padding: 32px 24px; color: #334155; font-size: 15px; line-height: 1.6;">
                  <p style="margin-top: 0;">Hola <strong>${name}</strong>,</p>
                  <p>Hemos procesado tu consulta sobre <strong>"${subject}"</strong>. A continuación te adjuntamos nuestra respuesta:</p>
                  
                  <!-- Reply Message Box -->
                  <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; border-radius: 8px; padding: 20px; margin: 24px 0; color: #1e293b; font-size: 15px; line-height: 1.6;">
                    ${replyMessage.replace(/\n/g, "<br/>")}
                  </div>

                  <p>Si tienes alguna otra duda o consulta adicional, puedes responder directamente a este correo o escribirnos a nuestro WhatsApp oficial.</p>
                  
                  <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0 24px 0;" />

                  <!-- Original Inquiry Box -->
                  <h4 style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; font-weight: bold;">Tu Consulta Original:</h4>
                  <p style="font-size: 13px; color: #64748b; font-style: italic; background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; margin: 0; border: 1px solid #e2e8f0;">
                    "${originalMessage}"
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; font-size: 12px; color: #64748b;">
                  <p style="margin: 0 0 6px 0; font-weight: bold;">Smartist Sublimación & Regalos</p>
                  <p style="margin: 0;">Lima, Perú. Catálogo online en <a href="https://smartist.pe" style="color: #6366f1; text-decoration: none;">smartist.pe</a></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (resend) {
    try {
      const fromEmail = "Smartist Soporte <onboarding@resend.dev>";
      const recipient = fromEmail.includes("onboarding@resend.dev") ? "joseluissalazarmeza1@gmail.com" : to;
      await resend.emails.send({
        from: fromEmail,
        to: [recipient],
        subject: `Re: ${subject} - Smartist`,
        html: emailHtml,
      });
      console.log(`Reply email sent successfully via Resend to ${to}`);
    } catch (err) {
      console.error("Error sending reply email:", err);
    }
  } else {
    console.log("----- MOCK EMAIL CONTACT REPLY -----");
    console.log(`To: ${to}`);
    console.log(`Subject: Re: ${subject}`);
    console.log(`Reply Content:\n${replyMessage}`);
    console.log("-------------------------------------");
  }
}

export async function sendCredentialsEmail(to: string, name: string, password: string, rolId: string) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`;
  const roleName = rolId === "ADMIN" ? "Administrador" : rolId === "VENDEDOR" ? "Vendedor / Colaborador" : "Cliente";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tus Credenciales de Acceso - Smartist</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 24px 0;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <!-- Header Gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Bienvenido a Smartist</h1>
                  <p style="color: #c084fc; margin: 8px 0 0 0; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Tus credenciales de acceso</p>
                </td>
              </tr>
              <!-- Body Content -->
              <tr>
                <td style="padding: 32px 24px;">
                  <p style="font-size: 16px; color: #334155; margin: 0 0 20px 0; line-height: 1.6;">
                    Hola <strong>${name || "Usuario"}</strong>,
                  </p>
                  <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0; line-height: 1.6;">
                    Se ha registrado una cuenta para ti en la plataforma de personalización y catálogo de <strong>Smartist</strong>.
                  </p>

                  <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                    <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Datos de Acceso</h4>
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #475569; width: 120px;"><strong>Rol:</strong></td>
                        <td style="padding: 4px 0; font-size: 14px; color: #1e293b; font-weight: bold;">${roleName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #475569;"><strong>Correo:</strong></td>
                        <td style="padding: 4px 0; font-size: 14px; color: #1e293b; font-weight: bold; color: #4f46e5;">${to}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #475569;"><strong>Contraseña:</strong></td>
                        <td style="padding: 4px 0; font-size: 14px; color: #1e293b; font-family: monospace; font-weight: bold; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; display: inline-block;">${password}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- CTA Button -->
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <tr>
                      <td align="center">
                        <a href="${loginUrl}" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.25);">
                          Iniciar Sesión en el Panel
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.6; text-align: center;">
                    Por razones de seguridad, te sugerimos cambiar tu contraseña una vez que ingreses a la plataforma.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9;">
                  <p style="margin: 0; font-size: 12px; color: #94a3b8;">Smartist © 2026. Todos los derechos reservados.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (resend) {
    try {
      const fromEmail = "Smartist <onboarding@resend.dev>";
      const recipient = fromEmail.includes("onboarding@resend.dev") ? "joseluissalazarmeza1@gmail.com" : to;
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: recipient,
        subject: "Bienvenido a Smartist - Tus Credenciales de Acceso",
        html: emailHtml,
      });

      if (error) {
        console.error("Resend email sending error:", error);
      } else {
        console.log("Credentials email sent successfully via Resend:", data?.id);
      }
    } catch (err) {
      console.error("Resend email sending connection error:", err);
    }
  } else {
    console.log("=== EMAIL CREDENTIALS SENT TO CONSOLE (Resend no configurado) ===");
    console.log(`Para: ${to}`);
    console.log(`Nombre: ${name}`);
    console.log(`Rol: ${roleName}`);
    console.log(`Contraseña: ${password}`);
    console.log("==================================================================");
  }
}

