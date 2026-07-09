import { getProductById } from "@/services/products";
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

  return <ProductCustomizer product={product} />;
}
