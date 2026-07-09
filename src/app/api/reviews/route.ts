import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, prodId, rating, comment } = body;

    // 1. Basic validation
    if (!orderId || !prodId || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Datos de reseña inválidos. La calificación debe ser de 1 a 5 estrellas." },
        { status: 400 }
      );
    }

    // 2. Fetch order and verify existence, status, and items
    const order = await prisma.pedido.findUnique({
      where: { id: orderId },
      include: {
        pedidoItems: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "El pedido especificado no existe." },
        { status: 404 }
      );
    }

    // Must be delivered (SHIPPED)
    if (order.estadoId !== "SHIPPED") {
      return NextResponse.json(
        { error: "Solo puedes calificar productos de pedidos entregados o listos." },
        { status: 400 }
      );
    }

    // Must contain the product
    const hasProduct = order.pedidoItems.some((item: any) => item.prodId === prodId);
    if (!hasProduct) {
      return NextResponse.json(
        { error: "Este producto no forma parte del pedido especificado." },
        { status: 400 }
      );
    }

    // Require usrId (user must exist on the order)
    if (!order.usrId) {
      return NextResponse.json(
        { error: "El pedido no tiene un usuario asignado válido." },
        { status: 400 }
      );
    }

    // 3. Prevent duplicate reviews for the same user + product
    const existingReview = await prisma.resena.findFirst({
      where: {
        prodId: prodId,
        usrId: order.usrId
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Ya has calificado este producto anteriormente." },
        { status: 400 }
      );
    }

    // 4. Create review
    const newReview = await prisma.resena.create({
      data: {
        prodId,
        usrId: order.usrId,
        calificacion: Math.round(rating),
        comentario: comment || "",
      }
    });

    return NextResponse.json({ success: true, review: newReview });
  } catch (error: any) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al guardar la reseña." },
      { status: 500 }
    );
  }
}

// GET /api/reviews — Fetch reviews for a product or user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prodId = searchParams.get("prodId");
    const usrId = searchParams.get("usrId");

    if (usrId) {
      const reviews = await prisma.resena.findMany({
        where: { usrId },
        orderBy: { creadoEn: "desc" }
      });
      return NextResponse.json(reviews);
    }

    if (!prodId) {
      return NextResponse.json(
        { error: "Falta el ID del producto (prodId) o el ID del usuario (usrId)." },
        { status: 400 }
      );
    }

    const reviews = await prisma.resena.findMany({
      where: { prodId },
      include: {
        usuario: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: { creadoEn: "desc" }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET reviews error:", error);
    return NextResponse.json(
      { error: "Error al cargar las reseñas." },
      { status: 500 }
    );
  }
}
