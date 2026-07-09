import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const paymentMethods = await prisma.metodoPago.findMany({
      orderBy: { nombre: "asc" }
    });
    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error("GET admin payment methods error:", error);
    return NextResponse.json({ error: "Error al cargar los métodos de pago." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const body = await req.json();
    const { id, nombre, tipo, numero, titular, qrUrl, inEstado } = body;

    if (!id || !nombre || !tipo) {
      return NextResponse.json({ error: "Faltan campos obligatorios (id, nombre, tipo)." }, { status: 400 });
    }

    const cleanId = id.toUpperCase().trim();
    const existing = await prisma.metodoPago.findUnique({ where: { id: cleanId } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe un método de pago con el código " + cleanId }, { status: 400 });
    }

    const created = await prisma.metodoPago.create({
      data: {
        id: cleanId,
        nombre: nombre.trim(),
        tipo: tipo.trim(),
        numero: numero || null,
        titular: titular || null,
        qrUrl: qrUrl || null,
        inEstado: inEstado !== undefined ? !!inEstado : true
      }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("POST admin payment method error:", error);
    return NextResponse.json({ error: error.message || "Error al crear el método de pago." }, { status: 500 });
  }
}
