import { prisma } from "@/lib/prisma";
import type { Product, ProductVariant } from "./product-types";

// Re-export types for consumers
export type { Product, ProductVariant } from "./product-types";

// Helper to extract options from titles dynamically so we don't have to alter DB schema
export function getVariantOptions(
  productId: string,
  title: string,
  sku: string
): { [key: string]: string } {
  const t = title.toLowerCase();
  const s = sku.toLowerCase();

  if (productId === "taza-blanca") {
    const capacity = t.includes("15oz") ? "15oz" : "11oz";
    return { capacidad: capacity, color: "Blanco" };
  }
  if (productId === "taza-magica") {
    const color = t.includes("rojo") ? "Rojo Mate" : "Negro Mate";
    return { capacidad: "11oz", color };
  }
  if (productId === "camiseta-deportiva") {
    let talla = "M";
    if (t.endsWith("- s") || s.includes("-s-")) talla = "S";
    else if (t.endsWith("- m") || s.includes("-m-")) talla = "M";
    else if (t.endsWith("- l") || s.includes("-l-")) talla = "L";
    else if (t.endsWith("- xl") || s.includes("-xl-")) talla = "XL";
    return { talla, genero: "Unisex" };
  }
  if (productId === "mousepad-gaming") {
    const tamaño = t.includes("xl") ? "XL (80x30cm)" : "Estándar (22x18cm)";
    return { tamaño };
  }

  // Fallback for custom products added by the user
  const options: { [key: string]: string } = {};

  // Try parsing "Key: Value, Key2: Value2"
  if (title.includes(":")) {
    const parts = title.split(",");
    parts.forEach((p: string) => {
      const subparts = p.split(":");
      if (subparts.length === 2) {
        options[subparts[0].trim()] = subparts[1].trim();
      }
    });
  }

  if (Object.keys(options).length === 0) {
    options["opción"] = title;
  }

  return options;
}

// --- DB row shapes (matches Spanish Prisma schema) ---
interface DbCategoryRow {
  id: number;
  nombre: string;
  slug: string;
}

interface DbVariantRow {
  id: string;
  prodId: string;
  sku: string;
  atributo: string;
  costoExt: unknown;
  precioExt: unknown;
  stock: number;
  imageUrl: string | null;
  glbModelUrl: string | null;
  blankMockupUrl: string | null;
  maskImageUrl: string | null;
  printDimensions: any;
  mockupConfig: any;
}

interface DbProductRow {
  id: string;
  catId: number;
  categoria: DbCategoryRow;
  provId: number | null;
  nombre: string;
  descrip: string;
  costo: unknown;
  precio: unknown;
  imagen: string | null;
  etiquetas: string | null;
  esCustom: boolean;
  activo: boolean;
  destacado: boolean;
  galleryImages: string[];
  blankMockupUrl: string | null;
  maskImageUrl: string | null;
  glbModelUrl: string | null;
  mockupConfig: any;
  printDimensions: any;
  createdAt: Date;
  variantes: DbVariantRow[];
}

// Convert a DB variant row to our app-level ProductVariant
function mapVariant(productBasePrice: number, productId: string, v: DbVariantRow): ProductVariant {
  const result: ProductVariant = {
    id: v.id,
    title: v.atributo,
    sku: v.sku,
    price: productBasePrice + Number(v.precioExt),
    stock: v.stock,
    glbModelUrl: v.glbModelUrl || null,
    blankMockupUrl: v.blankMockupUrl || null,
    maskImageUrl: v.maskImageUrl || null,
    printDimensions: v.printDimensions || null,
    mockupConfig: v.mockupConfig || null,
    options: getVariantOptions(productId, v.atributo, v.sku),
  };
  if (v.imageUrl) {
    result.imageUrl = v.imageUrl;
  }
  return result;
}

// Convert a DB product row (with included variants) to our app-level Product
function mapProduct(p: DbProductRow): Product {
  const basePrice = Number(p.precio);
  const variants = p.variantes.map((v: DbVariantRow) => mapVariant(basePrice, p.id, v));
  const firstImage = p.imagen ?? (p.galleryImages?.[0] ?? (variants.find((v: ProductVariant) => v.imageUrl)?.imageUrl ?? ""));

  return {
    id: p.id,
    name: p.nombre,
    description: p.descrip,
    category: p.categoria.nombre,
    isCustomizable: p.esCustom,
    basePrice,
    imageUrl: firstImage,
    galleryImages: p.galleryImages || [],
    destacado: p.destacado || false,
    blankMockupUrl: p.blankMockupUrl || null,
    maskImageUrl: p.maskImageUrl || null,
    glbModelUrl: p.glbModelUrl || null,
    mockupConfig: p.mockupConfig || null,
    printDimensions: p.printDimensions || null,
    variants,
  };
}

// Fetch products from database
export async function getProducts(
  category?: string,
  search?: string,
  destacadoOnly?: boolean,
  limit?: number
): Promise<Product[]> {
  try {
    const where: Record<string, any> = { activo: true };
    if (destacadoOnly) {
      where.destacado = true;
    }
    if (category && category !== "Todos") {
      where.categoria = { slug: category.toLowerCase() };
    }
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { descrip: { contains: search, mode: "insensitive" } },
      ];
    }

    const dbProducts = (await prisma.producto.findMany({
      where,
      include: {
        categoria: true,
        variantes: {
          orderBy: { precioExt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })) as unknown as DbProductRow[];

    return dbProducts.map(mapProduct);
  } catch (error) {
    console.error("Error fetching products from DB:", error);
    return [];
  }
}

// Fetch single product by id
export async function getProductById(
  id: string
): Promise<Product | undefined> {
  try {
    const p = (await prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: true,
        variantes: {
          orderBy: { precioExt: "asc" },
        },
      },
    })) as unknown as DbProductRow | null;

    if (!p) return undefined;

    return mapProduct(p);
  } catch (error) {
    console.error(`Error fetching product ${id} from DB:`, error);
    return undefined;
  }
}


