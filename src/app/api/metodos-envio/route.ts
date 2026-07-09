import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const shippingMethods = await prisma.metodoEnvio.findMany({
      where: { inEstado: true },
      orderBy: { costo: "asc" }
    });
    return NextResponse.json(shippingMethods);
  } catch (error: any) {
    console.error("Fetch shipping methods error:", error);
    return NextResponse.json(
      { error: "Error al cargar los métodos de envío." },
      { status: 500 }
    );
  }
}
