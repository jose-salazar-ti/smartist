import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const states = await prisma.estadoPedido.findMany({
      where: { inEstado: true },
    });
    return NextResponse.json(states);
  } catch (error: any) {
    console.error("Fetch order statuses error:", error);
    return NextResponse.json(
      { error: "Error al cargar los estados de pedido." },
      { status: 500 }
    );
  }
}
