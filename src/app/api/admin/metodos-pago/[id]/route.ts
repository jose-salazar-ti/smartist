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
    const { nombre, tipo, numero, titular, qrUrl, inEstado } = body;

    const existing = await prisma.metodoPago.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Método de pago no encontrado." }, { status: 404 });
    }

    const updated = await prisma.metodoPago.update({
      where: { id },
      data: {
        nombre: nombre !== undefined ? nombre.trim() : undefined,
        tipo: tipo !== undefined ? tipo.trim() : undefined,
        numero: numero !== undefined ? (numero || null) : undefined,
        titular: titular !== undefined ? (titular || null) : undefined,
        qrUrl: qrUrl !== undefined ? (qrUrl || null) : undefined,
        inEstado: inEstado !== undefined ? !!inEstado : undefined
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH admin payment method error:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar el método de pago." }, { status: 500 });
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

    // Check if there are orders using this payment method before hard-deleting, otherwise soft-delete (deactivate)
    const orderCount = await prisma.pedido.count({ where: { metodoPagoId: id } });

    if (orderCount > 0) {
      // Deactivate instead
      const deactivated = await prisma.metodoPago.update({
        where: { id },
        data: { inEstado: false }
      });
      return NextResponse.json({ success: true, deactivated: true, message: "Método de pago desactivado ya que tiene pedidos asociados." });
    }

    await prisma.metodoPago.delete({ where: { id } });
    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    console.error("DELETE admin payment method error:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar el método de pago." }, { status: 500 });
  }
}
