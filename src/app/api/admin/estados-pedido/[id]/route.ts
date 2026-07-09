import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const { id } = await params;
    const body = await req.json();
    const { nombre, descripcion, color, emailTitulo, emailDescripcion, inEstado } = body;

    const existing = await prisma.estadoPedido.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Estado de pedido no encontrado." }, { status: 404 });
    }

    const updated = await prisma.estadoPedido.update({
      where: { id },
      data: {
        nombre: nombre !== undefined ? nombre.trim() : undefined,
        descripcion: descripcion !== undefined ? (descripcion || null) : undefined,
        color: color !== undefined ? color.trim() : undefined,
        emailTitulo: emailTitulo !== undefined ? (emailTitulo || null) : undefined,
        emailDescripcion: emailDescripcion !== undefined ? (emailDescripcion || null) : undefined,
        inEstado: inEstado !== undefined ? !!inEstado : undefined
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH admin order status error:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar el estado de pedido." }, { status: 500 });
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

    // Check if there are orders using this status before deleting
    const orderCount = await prisma.pedido.count({ where: { estadoId: id } });

    if (orderCount > 0) {
      const deactivated = await prisma.estadoPedido.update({
        where: { id },
        data: { inEstado: false }
      });
      return NextResponse.json({ success: true, deactivated: true, message: "Estado de pedido desactivado ya que tiene pedidos asociados." });
    }

    await prisma.estadoPedido.delete({ where: { id } });
    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    console.error("DELETE admin order status error:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar el estado de pedido." }, { status: 500 });
  }
}
