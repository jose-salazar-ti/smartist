import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const shippingMethods = await prisma.metodoEnvio.findMany({
      orderBy: { costo: "asc" }
    });
    return NextResponse.json(shippingMethods);
  } catch (error) {
    console.error("GET admin shipping methods error:", error);
    return NextResponse.json({ error: "Error al cargar los métodos de envío." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const body = await req.json();
    const { id, nombre, costo, tiempoEstimado, inEstado } = body;

    if (!id || !nombre || costo === undefined) {
      return NextResponse.json({ error: "Faltan campos obligatorios (id, nombre, costo)." }, { status: 400 });
    }

    const cleanId = id.toUpperCase().trim();
    const existing = await prisma.metodoEnvio.findUnique({ where: { id: cleanId } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe un método de envío con el código " + cleanId }, { status: 400 });
    }

    const created = await prisma.metodoEnvio.create({
      data: {
        id: cleanId,
        nombre: nombre.trim(),
        costo: Number(costo),
        tiempoEstimado: tiempoEstimado || null,
        inEstado: inEstado !== undefined ? !!inEstado : true
      }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("POST admin shipping method error:", error);
    return NextResponse.json({ error: error.message || "Error al crear el método de envío." }, { status: 500 });
  }
}
