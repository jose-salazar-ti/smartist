import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.categoria.findMany({
      orderBy: { nombre: "asc" }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET public categories error:", error);
    return NextResponse.json(
      { error: "Error al cargar las categorías." },
      { status: 500 }
    );
  }
}
