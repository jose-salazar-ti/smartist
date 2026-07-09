import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCompanyQuoteEmail } from "@/services/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, contactName, email, phone, productType, quantity, message, logoUrl } = body;

    if (!companyName || !contactName || !email || !phone) {
      return NextResponse.json({ error: "Campos obligatorios faltantes." }, { status: 400 });
    }

    // Get contact email from settings
    const settings = await prisma.ajustes.findMany();
    const emailSetting = settings.find((s: any) => s.clave === "contactEmail");
    const targetEmail = emailSetting?.valor || "hola@smartist.pe";

    await sendCompanyQuoteEmail(targetEmail, {
      companyName,
      contactName,
      email,
      phone,
      productType,
      quantity,
      message,
      logoUrl,
    });

    // Guardar en la base de datos
    await prisma.mensajeContacto.create({
      data: {
        nombre: contactName,
        correo: email,
        telefono: phone,
        asunto: `Cotización Corporativa: ${productType} (${quantity} uds)`,
        mensaje: message || "",
        tipo: "EMPRESA",
        estado: "PENDIENTE",
        datosAdicionales: {
          razonSocial: companyName,
          producto: productType,
          cantidad: quantity,
          logoUrl: logoUrl || null
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/cotizar error:", error);
    return NextResponse.json(
      { error: "Error al procesar la cotización." },
      { status: 500 }
    );
  }
}
