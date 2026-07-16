import { getProductById, getProducts } from "@/services/products";
import { notFound } from "next/navigation";
import ProductCustomizer from "./ProductCustomizer";
import { Metadata } from "next";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);
  
  if (!product) {
    return {
      title: "Producto No Encontrado | Smartist",
    };
  }

  return {
    title: `Personalizar ${product.name} | Smartist`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  // Fetch similar products in the same category
  const allProductsInCat = await getProducts(product.category);
  const relatedProducts = allProductsInCat
    .filter((p) => p.id !== product.id)
    .slice(0, 4); // Limit to 4 related products

  return <ProductCustomizer product={product} relatedProducts={relatedProducts} />;
}
