import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/_next/", "/login"],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "ClaudeBot", "Google-Extended"],
        allow: ["/", "/productos", "/public/llms.txt"],
        disallow: ["/admin/", "/api/", "/carrito", "/checkout", "/login"],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
