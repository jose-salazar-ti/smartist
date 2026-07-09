import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Fetching registered products...");
  try {
    const products = await prisma.producto.findMany({
      select: {
        id: true,
        nombre: true,
        precio: true,
        imagen: true,
        esCustom: true,
      }
    });
    console.log("Products in DB:");
    console.log(JSON.stringify(products, null, 2));
  } catch (error: any) {
    console.error("Failed to query products:", error.message || error);
  }
}

main();
