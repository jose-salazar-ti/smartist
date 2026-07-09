import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-utils";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// PUT: Update category by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const { id } = await params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "ID de categoría inválido." }, { status: 400 });
    }

    const body = await req.json();
    const { nombre, slug, imagen } = body;

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: "El nombre de la categoría es obligatorio." },
        { status: 400 }
      );
    }

    const generatedSlug = slug && slug.trim() ? slugify(slug) : slugify(nombre);

    // Check if another category is using the target slug
    const collision = await prisma.categoria.findFirst({
      where: {
        slug: generatedSlug,
        id: { not: parsedId }
      }
    });

    if (collision) {
      return NextResponse.json(
        { error: `El slug/identificador "${generatedSlug}" ya está siendo utilizado por otra categoría.` },
        { status: 400 }
      );
    }

    const updated = await prisma.categoria.update({
      where: { id: parsedId },
      data: {
        nombre: nombre.trim(),
        slug: generatedSlug,
        imagen: imagen !== undefined ? imagen : undefined
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT admin category error:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar la categoría." },
      { status: 500 }
    );
  }
}

// DELETE: Delete category by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const { id } = await params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "ID de categoría inválido." }, { status: 400 });
    }

    // Integrity check: block deletion if products exist
    const productsCount = await prisma.producto.count({
      where: { catId: parsedId }
    });

    if (productsCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar la categoría porque tiene ${productsCount} producto(s) asociado(s). Reasigne o elimine los productos antes de continuar.` },
        { status: 400 }
      );
    }

    await prisma.categoria.delete({
      where: { id: parsedId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE admin category error:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar la categoría." },
      { status: 500 }
    );
  }
}
