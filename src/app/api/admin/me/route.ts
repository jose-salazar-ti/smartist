import { verifyAdmin } from "@/lib/auth-utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    return NextResponse.json({
      user: auth.user,
      isAdmin: auth.isAdmin,
      isSeller: auth.isSeller,
    });
  } catch (err) {
    console.error("Error in /api/admin/me:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
