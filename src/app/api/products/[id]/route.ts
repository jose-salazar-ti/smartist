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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.user) return auth.errorResponse!;

    const { id } = await params;

    // Verify ownership if user is a seller
    if (auth.isSeller) {
      const prod = await prisma.producto.findUnique({
        where: { id },
        select: { usuarioId: true }
      });
      if (prod && prod.usuarioId !== auth.user.id) {
        return NextResponse.json(
          { error: "Acceso denegado. No tienes permisos para editar este producto." },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { 
      name, description, category, isCustomizable, isActive, destacado, variants,
      galleryImages, blankMockupUrl, maskImageUrl, glbModelUrl, 
      printDimensions, features, benefits 
    } = body;

    if (!name || !description || !category) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (nombre, descripción, categoría)." },
        { status: 400 }
      );
    }

    // Run updates in a safe transaction
    const updatedProduct = await prisma.$transaction(async (tx: any) => {
      // Find or create Categoria
      let cat = await tx.categoria.findFirst({
        where: { nombre: category }
      });
      if (!cat) {
        cat = await tx.categoria.create({
          data: {
            nombre: category,
            slug: slugify(category)
          }
        });
      }

      const basePrice = Number(body.precio) || (variants && variants.length > 0 ? Number(variants[0].price) : 10.00);

      // Admin can update the product owner
      let ownerUpdate = undefined;
      if (auth.isAdmin && body.hasOwnProperty("usuarioId")) {
        ownerUpdate = body.usuarioId === "admin" || !body.usuarioId ? null : body.usuarioId;
      }

      // 1. Update basic product details
      const p = await tx.producto.update({
        where: { id },
        data: {
          catId: cat.id,
          nombre: name,
          descrip: description,
          costo: body.costo !== undefined ? Number(body.costo) : undefined,
          usuarioId: ownerUpdate,
          precio: basePrice,
          esCustom: isCustomizable !== undefined ? !!isCustomizable : undefined,
          activo: isActive !== undefined ? !!isActive : undefined,
          destacado: destacado !== undefined ? !!destacado : undefined,
          galleryImages: galleryImages !== undefined ? galleryImages : undefined,
          blankMockupUrl: blankMockupUrl !== undefined ? blankMockupUrl : undefined,
          maskImageUrl: maskImageUrl !== undefined ? maskImageUrl : undefined,
          glbModelUrl: glbModelUrl !== undefined ? glbModelUrl : undefined,
          printDimensions: printDimensions !== undefined ? printDimensions : undefined,
          features: features !== undefined ? features : undefined,
          benefits: benefits !== undefined ? benefits : undefined,
        }
      });

      // 2. Sync variants if provided in the payload
      if (variants && Array.isArray(variants)) {
        const payloadIds = variants.map((v: any) => v.id).filter(Boolean);

        // Delete variants that were removed by the admin
        await tx.varianteProducto.deleteMany({
          where: {
            prodId: id,
            id: { notIn: payloadIds }
          }
        });

        // Upsert variants
        for (const v of variants) {
          if (!v.sku || !v.title || v.price === undefined || v.stock === undefined) {
            throw new Error("Toda variante debe incluir título, SKU, precio y stock.");
          }

          // Check if SKU is taken by another variant (not belonging to this product variant)
          const skuCollision = await tx.varianteProducto.findFirst({
            where: {
              sku: v.sku,
              id: v.id ? { not: v.id } : undefined
            }
          });
          if (skuCollision) {
            throw new Error(`El SKU "${v.sku}" ya está registrado por otro producto.`);
          }

          const extraPrice = Math.max(0, Number(v.price) - basePrice);

          if (v.id) {
            // Update existing variant
            await tx.varianteProducto.update({
              where: { id: v.id },
              data: {
                atributo: v.title,
                sku: v.sku,
                precioExt: extraPrice,
                costoExt: v.costoExt !== undefined ? Number(v.costoExt) : undefined,
                stock: Number(v.stock),
                imageUrl: v.imageUrl || null,
                glbModelUrl: v.glbModelUrl || null,
                blankMockupUrl: v.blankMockupUrl || null,
                maskImageUrl: v.maskImageUrl || null,
                printDimensions: v.printDimensions || null,
                mockupConfig: v.mockupConfig || null
              }
            });
          } else {
            // Create new variant
            await tx.varianteProducto.create({
              data: {
                prodId: id,
                atributo: v.title,
                sku: v.sku,
                precioExt: extraPrice,
                costoExt: v.costoExt !== undefined ? Number(v.costoExt) : 0.00,
                stock: Number(v.stock),
                imageUrl: v.imageUrl || null,
                glbModelUrl: v.glbModelUrl || null,
                blankMockupUrl: v.blankMockupUrl || null,
                maskImageUrl: v.maskImageUrl || null,
                printDimensions: v.printDimensions || null,
                mockupConfig: v.mockupConfig || null
              }
            });
          }
        }
      }

      return p;
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error(`Product edit API error for ${req.url}:`, error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar el producto." },
      { status: 500 }
    );
  }
}

// DELETE: Deactivate product (setting activo: false) as requested by user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const auth = await verifyAdmin();
    if (!auth.user) return auth.errorResponse!;

    // Verify ownership if user is a seller
    if (auth.isSeller) {
      const prod = await prisma.producto.findUnique({
        where: { id },
        select: { usuarioId: true }
      });
      if (prod && prod.usuarioId !== auth.user.id) {
        return NextResponse.json(
          { error: "Acceso denegado. No tienes permisos para eliminar este producto." },
          { status: 403 }
        );
      }
    }

    const deactivatedProduct = await prisma.producto.update({
      where: { id },
      data: { activo: false }
    });

    return NextResponse.json({ success: true, product: deactivatedProduct });
  } catch (error: any) {
    console.error(`Product deactivation error for ${id}:`, error);
    return NextResponse.json(
      { error: "Error al desactivar el producto de la base de datos." },
      { status: 500 }
    );
  }
}
