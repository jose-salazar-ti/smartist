import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

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

// GET: Fetch all products for admin backoffice (both active and inactive)
export async function GET(req: NextRequest) {
  try {
    const products = await prisma.producto.findMany({
      include: {
        categoria: true,
        variantes: {
          orderBy: { precioExt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const mappedProducts = products.map((p: any) => {
      const basePrice = Number(p.precio);
      const variants = p.variantes.map((v: any) => ({
        id: v.id,
        title: v.atributo,
        sku: v.sku,
        price: basePrice + Number(v.precioExt),
        stock: v.stock,
        imageUrl: v.imageUrl || undefined,
        glbModelUrl: v.glbModelUrl || null,
        blankMockupUrl: v.blankMockupUrl || null,
        maskImageUrl: v.maskImageUrl || null,
        printDimensions: v.printDimensions || null,
        mockupConfig: v.mockupConfig || null
      }));
      const firstImage = p.imagen ?? (p.galleryImages?.[0] ?? (variants.find((v: any) => v.imageUrl)?.imageUrl ?? ""));

      return {
        id: p.id,
        name: p.nombre,
        description: p.descrip,
        category: p.categoria.nombre,
        isCustomizable: p.esCustom,
        isActive: p.activo,
        destacado: p.destacado,
        basePrice,
        imageUrl: firstImage,
        galleryImages: p.galleryImages || [],
        blankMockupUrl: p.blankMockupUrl || null,
        maskImageUrl: p.maskImageUrl || null,
        glbModelUrl: p.glbModelUrl || null,
        mockupConfig: p.mockupConfig || null,
        printDimensions: p.printDimensions || null,
        features: p.features || [],
        benefits: p.benefits || [],
        variants
      };
    });

    return NextResponse.json(mappedProducts);
  } catch (error: any) {
    console.error("GET admin products error:", error);
    return NextResponse.json(
      { error: "Error al cargar la lista de productos." },
      { status: 500 }
    );
  }
}

// POST: Create a new product with variants
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.user) return auth.errorResponse!;

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

    // 1. Generate clean unique slug for product ID
    const baseSlug = slugify(name);
    let id = baseSlug;
    let exists = await prisma.producto.findUnique({ where: { id } });
    let counter = 1;
    while (exists) {
      id = `${baseSlug}-${counter}`;
      exists = await prisma.producto.findUnique({ where: { id } });
      counter++;
    }

    // Find or create Categoria by name
    let cat = await prisma.categoria.findFirst({
      where: { nombre: category }
    });
    if (!cat) {
      cat = await prisma.categoria.create({
        data: {
          nombre: category,
          slug: slugify(category)
        }
      });
    }

    // 2. Validate and define variants
    const finalVariants = variants && variants.length > 0 ? variants : [{
      title: "Estándar",
      sku: `SKU-${id.toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      price: 10.0,
      stock: 50,
      imageUrl: null
    }];

    // Validate unique SKUs across DB before creating
    let hasMerged = false;
    for (const v of finalVariants) {
      if (!v.sku || !v.title || v.price === undefined || v.stock === undefined) {
        return NextResponse.json(
          { error: "Todos los variantes deben incluir título, SKU, precio y stock." },
          { status: 400 }
        );
      }

      const skuExists = await prisma.varianteProducto.findUnique({
        where: { sku: v.sku }
      });
      if (skuExists) {
        // SKU already exists: sum the stock to the existing variant
        await prisma.varianteProducto.update({
          where: { sku: v.sku },
          data: {
            stock: {
              increment: Number(v.stock),
            },
          },
        });
        hasMerged = true;
      }
    }

    // If any SKUs were merged/summed, return success immediately without creating a new product
    if (hasMerged) {
      return NextResponse.json({
        success: true,
        message: "Se detectó que el SKU de la variante ya existía. El stock se sumó correctamente al inventario actual.",
        merged: true
      });
    }

    // Base price is either the explicitly passed price or the first variant's price
    const basePrice = Number(body.precio) || Number(finalVariants[0].price) || 10.00;

    // Determine the product owner
    let productOwnerId = auth.user.id;
    if (auth.isAdmin) {
      productOwnerId = body.usuarioId === "admin" || !body.usuarioId ? null : body.usuarioId;
    } else {
      productOwnerId = auth.user.id;
    }

    // 3. Create product and variants in database
    const createdProduct = await prisma.producto.create({
      data: {
        id,
        catId: cat.id,
        usuarioId: productOwnerId,
        nombre: name,
        descrip: description,
        costo: Number(body.costo) || 0.00,
        precio: basePrice,
        esCustom: !!isCustomizable,
        activo: isActive !== undefined ? !!isActive : true,
        destacado: !!destacado,
        galleryImages: galleryImages || [],
        blankMockupUrl: blankMockupUrl || null,
        maskImageUrl: maskImageUrl || null,
        glbModelUrl: glbModelUrl || null,
        printDimensions: printDimensions || null,
        features: features || [],
        benefits: benefits || [],
        variantes: {
          create: finalVariants.map((v: any) => ({
            sku: v.sku,
            atributo: v.title,
            costoExt: Number(v.costoExt) || 0.00,
            precioExt: Math.max(0, Number(v.price) - basePrice),
            stock: Number(v.stock),
            imageUrl: v.imageUrl || null,
            glbModelUrl: v.glbModelUrl || null,
            blankMockupUrl: v.blankMockupUrl || null,
            maskImageUrl: v.maskImageUrl || null,
            printDimensions: v.printDimensions || null,
            mockupConfig: v.mockupConfig || null
          }))
        }
      },
      include: {
        categoria: true,
        variantes: true
      }
    });

    // Map back to expected client structure for safety
    const clientProduct = {
      id: createdProduct.id,
      name: createdProduct.nombre,
      description: createdProduct.descrip,
      category: createdProduct.categoria.nombre,
      isCustomizable: createdProduct.esCustom,
      isActive: createdProduct.activo,
      destacado: createdProduct.destacado,
      basePrice,
      imageUrl: createdProduct.imagen || (createdProduct.galleryImages?.[0] || (finalVariants[0].imageUrl ?? "")),
      galleryImages: createdProduct.galleryImages,
      blankMockupUrl: createdProduct.blankMockupUrl,
      maskImageUrl: createdProduct.maskImageUrl,
      glbModelUrl: createdProduct.glbModelUrl,
      printDimensions: createdProduct.printDimensions,
      features: createdProduct.features,
      benefits: createdProduct.benefits,
      variants: createdProduct.variantes.map((v: any) => ({
        id: v.id,
        title: v.atributo,
        sku: v.sku,
        price: basePrice + Number(v.precioExt),
        stock: v.stock,
        imageUrl: v.imageUrl || undefined,
        glbModelUrl: v.glbModelUrl || null,
        blankMockupUrl: v.blankMockupUrl || null,
        maskImageUrl: v.maskImageUrl || null,
        printDimensions: v.printDimensions || null,
        mockupConfig: v.mockupConfig || null
      }))
    };

    // Revalidate Next.js cache so the new product appears immediately on the catalog and home pages
    revalidatePath("/productos");
    revalidatePath(`/productos/${createdProduct.id}`);
    revalidatePath("/");

    return NextResponse.json({ success: true, product: clientProduct });
  } catch (error: any) {
    console.error("Product creation API error:", error);
    return NextResponse.json(
      { error: "Error al crear el producto." },
      { status: 500 }
    );
  }
}
