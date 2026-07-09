import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Static routes
  const routes = [
    "",
    "/carrito",
    "/emprendedores",
    "/empresas",
    "/regalos",
    "/productos",
    "/rastrear",
    "/politica-de-privacidad",
    "/terminos-y-condiciones",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic product routes
  try {
    const products = await prisma.producto.findMany({
      where: { activo: true },
      select: { id: true, createdAt: true },
    });

    const productRoutes = products.map((p: any) => ({
      url: `${baseUrl}/productos/${p.id}`,
      lastModified: p.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...routes, ...productRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
    return routes;
  }
}
