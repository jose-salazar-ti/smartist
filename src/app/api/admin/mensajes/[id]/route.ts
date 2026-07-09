import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-utils";
import { sendContactReplyEmail } from "@/services/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const { id } = await params;
    const body = await req.json();
    const { estado, respuesta } = body;

    const existing = await prisma.mensajeContacto.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Mensaje no encontrado." }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (estado !== undefined) {
      dataToUpdate.estado = estado;
    }

    if (respuesta !== undefined) {
      dataToUpdate.respuesta = respuesta.trim();
      dataToUpdate.estado = "RESPONDIDO";
      dataToUpdate.respondidoEn = new Date();
    }

    const updated = await prisma.mensajeContacto.update({
      where: { id },
      data: dataToUpdate
    });

    // Enviar correo de respuesta si es una acción de responder y el cliente tiene correo registrado
    if (respuesta !== undefined && existing.correo && existing.correo.trim().length > 0) {
      await sendContactReplyEmail(existing.correo, {
        name: existing.nombre,
        subject: existing.asunto,
        originalMessage: existing.mensaje,
        replyMessage: respuesta.trim()
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH admin message error:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar el mensaje." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const { id } = await params;
    await prisma.mensajeContacto.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE admin message error:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar el mensaje." }, { status: 500 });
  }
}
