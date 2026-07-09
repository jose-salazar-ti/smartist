import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

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

// GET: List all categories with product count for admin dashboard
export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const categories = await prisma.categoria.findMany({
      include: {
        _count: {
          select: { productos: true }
        }
      },
      orderBy: { nombre: "asc" }
    });

    // Map _count representation to a cleaner key
    const mapped = categories.map((c: any) => ({
      id: c.id,
      nombre: c.nombre,
      slug: c.slug,
      imagen: c.imagen,
      productCount: c._count.productos
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET admin categories error:", error);
    return NextResponse.json(
      { error: "Error al cargar las categorías." },
      { status: 500 }
    );
  }
}

// POST: Create a new category
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const body = await req.json();
    const { nombre, slug, imagen } = body;

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: "El nombre de la categoría es obligatorio." },
        { status: 400 }
      );
    }

    const generatedSlug = slug && slug.trim() ? slugify(slug) : slugify(nombre);

    // Validate unique slug
    const existing = await prisma.categoria.findUnique({
      where: { slug: generatedSlug }
    });

    if (existing) {
      return NextResponse.json(
        { error: `Ya existe una categoría con el slug/identificador "${generatedSlug}".` },
        { status: 400 }
      );
    }

    const newCategory = await prisma.categoria.create({
      data: {
        nombre: nombre.trim(),
        slug: generatedSlug,
        imagen: imagen || null
      }
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    console.error("POST admin category error:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear la categoría." },
      { status: 500 }
    );
  }
}
