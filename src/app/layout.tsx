import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Smartist | Personalización con Inteligencia Artificial y Regalos Premium",
  description: "Personaliza tus tazas, camisetas y regalos con nuestro editor 3D y tecnología de mejoramiento de imágenes con Inteligencia Artificial. Acabados de lujo y envíos a todo el Perú.",
  keywords: ["smartist", "sublimacion peru", "tazas personalizadas", "camisetas personalizadas", "regalos personalizados", "inteligencia artificial", "regalos B2B", "yape plin"],
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://wpmnsyqabcdxkpfydamn.supabase.co" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans overflow-x-hidden">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster position="top-right" theme="light" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
