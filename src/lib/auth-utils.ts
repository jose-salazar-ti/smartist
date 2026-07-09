import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Verifica si el usuario actual está autenticado y tiene rol de ADMIN.
 * Retorna el usuario de la base de datos si es administrador, o lanza/retorna una respuesta de error.
 */
export async function verifyAdmin() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.log("verifyAdmin: No Supabase user found or error:", error);
      return {
        errorResponse: NextResponse.json(
          { error: "No autorizado. Inicie sesión." },
          { status: 401 }
        ),
        isAdmin: false,
        isSeller: false,
      };
    }

    console.log("verifyAdmin: Supabase user email =", user.email);

    const dbUser = await prisma.usuario.findUnique({
      where: { correo: user.email! },
      select: { rolId: true, id: true, nombre: true, correo: true },
    });

    console.log("verifyAdmin: Database user record =", dbUser);

    if (!dbUser || (dbUser.rolId !== "ADMIN" && dbUser.rolId !== "VENDEDOR")) {
      return {
        errorResponse: NextResponse.json(
          { error: "Acceso denegado. Se requieren privilegios de administrador o vendedor." },
          { status: 403 }
        ),
        isAdmin: false,
        isSeller: false,
      };
    }

    return {
      user: dbUser,
      isAdmin: dbUser.rolId === "ADMIN",
      isSeller: dbUser.rolId === "VENDEDOR",
    };
  } catch (err) {
    console.error("Error verifying admin role:", err);
    return {
      errorResponse: NextResponse.json(
        { error: "Error interno del servidor al verificar autorización." },
        { status: 500 }
      ),
      isAdmin: false,
      isSeller: false,
    };
  }
}
