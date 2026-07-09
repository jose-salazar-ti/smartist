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
    const { nombre, costo, tiempoEstimado, inEstado } = body;

    const existing = await prisma.metodoEnvio.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Método de envío no encontrado." }, { status: 404 });
    }

    const updated = await prisma.metodoEnvio.update({
      where: { id },
      data: {
        nombre: nombre !== undefined ? nombre.trim() : undefined,
        costo: costo !== undefined ? Number(costo) : undefined,
        tiempoEstimado: tiempoEstimado !== undefined ? (tiempoEstimado || null) : undefined,
        inEstado: inEstado !== undefined ? !!inEstado : undefined
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH admin shipping method error:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar el método de envío." }, { status: 500 });
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

    // Check if there are orders using this shipping method before deleting
    const orderCount = await prisma.pedido.count({ where: { tipoEntregaId: id } });

    if (orderCount > 0) {
      const deactivated = await prisma.metodoEnvio.update({
        where: { id },
        data: { inEstado: false }
      });
      return NextResponse.json({ success: true, deactivated: true, message: "Método de envío desactivado ya que tiene pedidos asociados." });
    }

    await prisma.metodoEnvio.delete({ where: { id } });
    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    console.error("DELETE admin shipping method error:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar el método de envío." }, { status: 500 });
  }
}
