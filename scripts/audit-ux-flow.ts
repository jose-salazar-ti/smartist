import "dotenv/config";
import { prisma } from "../src/lib/prisma";

interface AuditResult {
  step: string;
  category: "UX/UI" | "API Performance" | "Database" | "Flow Fluidity";
  status: "PASS" | "WARN" | "FAIL";
  durationMs: number;
  details: string;
}

async function runUXAudit() {
  console.log("=================================================");
  console.log("🚀 SMARTIST - AUDITORÍA INTEGRAL DE UX/UI Y FLUIDEZ");
  console.log("=================================================\n");

  const results: AuditResult[] = [];
  const startTime = Date.now();

  // 1. Audit DB Connection & Categories Query Speed
  try {
    const t0 = Date.now();
    const categories = await prisma.categoria.findMany({
      include: { _count: { select: { productos: true } } }
    });
    const duration = Date.now() - t0;
    results.push({
      step: "Consulta de Categorías en Base de Datos",
      category: "Database",
      status: duration < 150 ? "PASS" : "WARN",
      durationMs: duration,
      details: `Obtenidas ${categories.length} categorías en ${duration}ms.`
    });
  } catch (err: any) {
    results.push({
      step: "Consulta de Categorías",
      category: "Database",
      status: "FAIL",
      durationMs: 0,
      details: `Error al conectar a DB: ${err.message}`
    });
  }

  // 2. Audit Products Catalog Read Performance
  try {
    const t0 = Date.now();
    const products = await prisma.producto.findMany({
      take: 20,
      include: {
        categorias: true,
        variantes: true,
      }
    });
    const duration = Date.now() - t0;
    results.push({
      step: "Carga del Catálogo Principal de Productos",
      category: "API Performance",
      status: duration < 200 ? "PASS" : "WARN",
      durationMs: duration,
      details: `Cargados ${products.length} productos con variantes en ${duration}ms.`
    });
  } catch (err: any) {
    results.push({
      step: "Carga del Catálogo Principal",
      category: "API Performance",
      status: "FAIL",
      durationMs: 0,
      details: `Error: ${err.message}`
    });
  }

  // 3. Audit Payment & Shipping Methods Load Speed
  try {
    const t0 = Date.now();
    const paymentMethods = await prisma.metodoPago.findMany({ where: { inEstado: true } });
    const shippingMethods = await prisma.metodoEnvio.findMany({ where: { inEstado: true } });
    const duration = Date.now() - t0;
    results.push({
      step: "Precarga del Flujo de Checkout (Métodos de Pago y Envío)",
      category: "Flow Fluidity",
      status: duration < 100 ? "PASS" : "WARN",
      durationMs: duration,
      details: `${paymentMethods.length} métodos de pago y ${shippingMethods.length} métodos de envío listos en ${duration}ms.`
    });
  } catch (err: any) {
    results.push({
      step: "Precarga de Checkout",
      category: "Flow Fluidity",
      status: "FAIL",
      durationMs: 0,
      details: `Error: ${err.message}`
    });
  }

  // 4. Audit Product Gallery Images Integrity
  try {
    const t0 = Date.now();
    const productsWithImages = await prisma.producto.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, imagen: true, galleryImages: true }
    });
    let missingImagesCount = 0;
    for (const p of productsWithImages) {
      if (!p.imagen || p.imagen === "") missingImagesCount++;
    }
    const duration = Date.now() - t0;
    results.push({
      step: "Integridad Visual de Imágenes en Catálogo (UX/UI)",
      category: "UX/UI",
      status: missingImagesCount === 0 ? "PASS" : "WARN",
      durationMs: duration,
      details: missingImagesCount === 0
        ? `Todas las portadas de productos están asignadas correctamente.`
        : `${missingImagesCount} producto(s) no tienen imagen de portada asignada.`
    });
  } catch (err: any) {
    results.push({
      step: "Integridad Visual de Imágenes",
      category: "UX/UI",
      status: "FAIL",
      durationMs: 0,
      details: `Error: ${err.message}`
    });
  }

  // 5. Output Results Table
  console.log("📊 RESULTADOS DE LA AUDITORÍA:\n");
  results.forEach((r, idx) => {
    const badge = r.status === "PASS" ? "✅ PASS" : r.status === "WARN" ? "⚠️ WARN" : "❌ FAIL";
    console.log(`${idx + 1}. [${badge}] ${r.step} (${r.durationMs}ms)`);
    console.log(`   Categoría: ${r.category}`);
    console.log(`   Detalle: ${r.details}\n`);
  });

  const totalDuration = Date.now() - startTime;
  console.log(`-------------------------------------------------`);
  console.log(`⏱️ Tiempo total de auditoría de flujo: ${totalDuration}ms`);
  console.log(`=================================================\n`);
}

runUXAudit()
  .catch((err) => {
    console.error("Error al ejecutar bot de auditoría:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
