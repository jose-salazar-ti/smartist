import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, remitente, destinatario, mensaje, imagenUrl, spotifyUri, patronKey, bgColor } = body;

    if (!remitente || !destinatario || !mensaje) {
      return NextResponse.json(
        { error: "Los campos remitente, destinatario y mensaje son obligatorios." },
        { status: 400 }
      );
    }

    // Si hay un orderId, verificar que el pedido exista
    if (orderId) {
      const order = await prisma.pedido.findUnique({
        where: { id: orderId }
      });
      if (!order) {
        return NextResponse.json(
          { error: "El pedido especificado no existe." },
          { status: 404 }
        );
      }
    }

    const dedicatoria = await prisma.dedicatoria.create({
      data: {
        orderId: orderId || null,
        remitente,
        destinatario,
        mensaje,
        imagenUrl: imagenUrl || null,
        spotifyUri: spotifyUri || null,
        patronKey: patronKey || "heart",
        bgColor: bgColor || "#fdf8f5"
      }
    });

    return NextResponse.json({ success: true, id: dedicatoria.id }, { status: 201 });
  } catch (err: any) {
    console.error("Error al guardar dedicatoria:", err);
    return NextResponse.json(
      { error: "Error interno del servidor al crear la dedicatoria." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      const auth = await verifyAdmin();
      if (!auth.isAdmin) {
        return NextResponse.json(
          { error: "Acceso denegado. Se requiere administrador." },
          { status: 403 }
        );
      }

      const dedicatorias = await prisma.dedicatoria.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          pedido: {
            select: {
              id: true,
              total: true,
              estadoId: true
            }
          }
        }
      });

      return NextResponse.json(dedicatorias);
    }

    const dedicatoria = await prisma.dedicatoria.findUnique({
      where: { id },
      include: {
        pedido: {
          include: {
            pedidoItems: {
              include: {
                producto: true
              }
            }
          }
        }
      }
    });

    if (!dedicatoria) {
      return NextResponse.json(
        { error: "La dedicatoria solicitada no existe." },
        { status: 404 }
      );
    }

    // Incrementar el contador de vistas para medir tracción de marketing
    await prisma.dedicatoria.update({
      where: { id },
      data: {
        vistaContador: { increment: 1 }
      }
    });

    return NextResponse.json(dedicatoria);
  } catch (err: any) {
    console.error("Error al obtener dedicatoria:", err);
    return NextResponse.json(
      { error: "Error interno al recuperar la dedicatoria." },
      { status: 500 }
    );
  }
}
