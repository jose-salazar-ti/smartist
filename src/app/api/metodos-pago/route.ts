import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const paymentMethods = await prisma.metodoPago.findMany({
      where: { inEstado: true },
      orderBy: { nombre: "asc" }
    });
    return NextResponse.json(paymentMethods);
  } catch (error: any) {
    console.error("Fetch payment methods error:", error);
    return NextResponse.json(
      { error: "Error al cargar los métodos de pago." },
      { status: 500 }
    );
  }
}
