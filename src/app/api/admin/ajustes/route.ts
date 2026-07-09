import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-utils";

// GET /api/admin/ajustes — Obtiene todos los ajustes (público)
export async function GET() {
  try {
    const settingsList = await prisma.ajustes.findMany();
    
    // Transformar a un objeto simple { clave: valor }
    const settings = settingsList.reduce((acc: Record<string, string>, curr: any) => {
      acc[curr.clave] = curr.valor;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET settings error:", error);
    return NextResponse.json(
      { error: "Error al cargar los ajustes del negocio." },
      { status: 500 }
    );
  }
}

// POST /api/admin/ajustes — Guarda o actualiza múltiples ajustes (Admin únicamente)
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    console.log("POST /api/admin/ajustes auth:", auth);
    if (!auth.isAdmin) return auth.errorResponse!;

    const body = await req.json(); // Espera un objeto { [clave]: valor }
    console.log("POST /api/admin/ajustes body:", body);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Cuerpo de solicitud inválido." },
        { status: 400 }
      );
    }

    const updates = Object.entries(body).map(([clave, valor]) => {
      return prisma.ajustes.upsert({
        where: { clave },
        update: { valor: String(valor ?? "") },
        create: { clave, valor: String(valor ?? "") },
      });
    });

    await prisma.$transaction(updates);
    console.log("POST /api/admin/ajustes saved successfully!");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST settings error details:", error);
    return NextResponse.json(
      { error: `Error al guardar los ajustes del negocio: ${error?.message || error}` },
      { status: 500 }
    );
  }
}
