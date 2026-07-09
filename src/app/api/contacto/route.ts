import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactFormEmail } from "@/services/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
    }

    // Get contact email from settings
    const settings = await prisma.ajustes.findMany();
    const emailSetting = settings.find((s: any) => s.clave === "contactEmail");
    const targetEmail = emailSetting?.valor || "hola@smartist.pe";

    await sendContactFormEmail(targetEmail, {
      name,
      email,
      phone,
      subject,
      message,
    });

    // Guardar en la base de datos para lectura en el panel
    await prisma.mensajeContacto.create({
      data: {
        nombre: name,
        correo: email,
        telefono: phone,
        asunto: subject,
        mensaje: message,
        tipo: "CONTACTO",
        estado: "PENDIENTE"
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/contacto error:", error);
    return NextResponse.json(
      { error: "Error al enviar el mensaje de contacto." },
      { status: 500 }
    );
  }
}
