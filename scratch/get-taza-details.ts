import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Fetching details for taza-blanca-11-oz...");
  try {
    const product = await prisma.producto.findUnique({
      where: { id: "taza-blanca-11-oz" },
      include: {
        variantes: true
      }
    });
    console.log("Product Details:");
    console.log(JSON.stringify(product, null, 2));
  } catch (error: any) {
    console.error("Failed to query product details:", error.message || error);
  }
}

main();
