import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/auth-utils";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCredentialsEmail } from "@/services/email";

// GET /api/admin/usuarios — lista todos los usuarios con sus roles
export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Query roles from PostgreSQL
    const dbUsers = await prisma.usuario.findMany({
      select: { id: true, rolId: true }
    });
    const dbUsersMap = new Map(dbUsers.map((u: any) => [u.id, u.rolId]));

    const users = data.users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      confirmed: !!u.email_confirmed_at,
      user_metadata: u.user_metadata,
      rolId: dbUsersMap.get(u.id) || "CLIENTE"
    }));

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Error listing users:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST /api/admin/usuarios — crea un nuevo usuario con rol asignado
export async function POST(req: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const body = await req.json();
    const { email, password, name, rolId } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirmar sin email
      user_metadata: { name: name || "" },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const newUser = data.user;
    const selectedRolId = rolId || "ADMIN";

    // Crear registro correspondiente en base de datos PostgreSQL
    await prisma.usuario.create({
      data: {
        id: newUser.id,
        nombre: name || "Nuevo Usuario",
        correo: email,
        rolId: selectedRolId,
      }
    });

    // Enviar correo de bienvenida con credenciales (asíncronamente de fondo)
    sendCredentialsEmail(email, name || "Nuevo Usuario", password, selectedRolId)
      .catch((err) => console.error("Error al enviar email de bienvenida:", err));

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (err) {
    console.error("Error creating user:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE /api/admin/usuarios?id=xxx — elimina un usuario
export async function DELETE(req: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
    }

    // Eliminar primero en PostgreSQL para mantener integridad referencial
    await prisma.usuario.deleteMany({
      where: { id }
    });

    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PATCH /api/admin/usuarios — actualiza contraseña o rol de un usuario
export async function PATCH(req: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const { id, password, rolId } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
    }

    // Si se envía un rolId, actualizar o insertar en PostgreSQL (upsert) para evitar fallos si el usuario no existe en DB
    if (rolId) {
      const supabase = createAdminClient();
      const { data: userData } = await supabase.auth.admin.getUserById(id);
      const email = userData?.user?.email || "";
      const name = userData?.user?.user_metadata?.name || "Usuario";

      // Evitar conflictos de restricción Unique en el campo correo:
      // Si existe un usuario en la base de datos con el mismo correo pero diferente ID de autenticación (ej: de un seed anterior), se elimina.
      if (email) {
        await prisma.usuario.deleteMany({
          where: {
            correo: email,
            id: { not: id }
          }
        });
      }

      await prisma.usuario.upsert({
        where: { id },
        update: { rolId },
        create: {
          id,
          correo: email,
          nombre: name,
          rolId
        }
      });
    }

    // Si se envía contraseña, actualizar en Supabase Auth
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
      }

      const supabase = createAdminClient();
      const { error } = await supabase.auth.admin.updateUserById(id, {
        password: password,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}


