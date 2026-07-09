import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const orderStatuses = await prisma.estadoPedido.findMany({
      orderBy: { nombre: "asc" }
    });
    return NextResponse.json(orderStatuses);
  } catch (error) {
    console.error("GET admin order statuses error:", error);
    return NextResponse.json({ error: "Error al cargar los estados de pedido." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const body = await req.json();
    const { id, nombre, descripcion, color, emailTitulo, emailDescripcion, inEstado } = body;

    if (!id || !nombre || !color) {
      return NextResponse.json({ error: "Faltan campos obligatorios (id, nombre, color)." }, { status: 400 });
    }

    const cleanId = id.toUpperCase().trim();
    const existing = await prisma.estadoPedido.findUnique({ where: { id: cleanId } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe un estado de pedido con el código " + cleanId }, { status: 400 });
    }

    const created = await prisma.estadoPedido.create({
      data: {
        id: cleanId,
        nombre: nombre.trim(),
        descripcion: descripcion || null,
        color: color.trim(),
        emailTitulo: emailTitulo || null,
        emailDescripcion: emailDescripcion || null,
        inEstado: inEstado !== undefined ? !!inEstado : true
      }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("POST admin order status error:", error);
    return NextResponse.json({ error: error.message || "Error al crear el estado de pedido." }, { status: 500 });
  }
}
