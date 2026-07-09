import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const messages = await prisma.mensajeContacto.findMany({
      orderBy: { creadoEn: "desc" }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET admin messages error:", error);
    return NextResponse.json({ error: "Error al cargar los mensajes de contacto." }, { status: 500 });
  }
}


