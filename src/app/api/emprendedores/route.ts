import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendResellerApplicationEmail } from "@/services/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, whatsapp, city, storeName, experience, businessDetails } = body;

    if (!fullName || !whatsapp || !city) {
      return NextResponse.json({ error: "Campos obligatorios faltantes." }, { status: 400 });
    }

    // Get contact email from settings
    const settings = await prisma.ajustes.findMany();
    const emailSetting = settings.find((s: any) => s.clave === "contactEmail");
    const targetEmail = emailSetting?.valor || "hola@smartist.pe";

    await sendResellerApplicationEmail(targetEmail, {
      fullName,
      whatsapp,
      city,
      storeName,
      experience,
      businessDetails,
    });

    // Guardar en la base de datos
    await prisma.mensajeContacto.create({
      data: {
        nombre: fullName,
        correo: email || null,
        telefono: whatsapp,
        asunto: `Solicitud de Emprendedor: ${storeName || "Dropshipping"}`,
        mensaje: businessDetails || "",
        tipo: "EMPRENDEDOR",
        estado: "PENDIENTE",
        datosAdicionales: {
          tienda: storeName || null,
          ciudad: city,
          experiencia: experience
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/emprendedores error:", error);
    return NextResponse.json(
      { error: "Error al procesar el registro." },
      { status: 500 }
    );
  }
}
