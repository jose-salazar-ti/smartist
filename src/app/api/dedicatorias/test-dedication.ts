import { prisma } from "../../../lib/prisma";

async function test() {
  try {
    console.log("Testing Prisma insert for Dedicatoria...");
    const testDed = await prisma.dedicatoria.create({
      data: {
        remitente: "Test Remitente",
        destinatario: "Test Destinatario",
        mensaje: "Test Mensaje",
        patronKey: "gift",
        bgColor: "#fff0f6",
        spotifyUri: "spotify:track:0tgVpDi06FyKpA1z0VMD4v"
      }
    });
    console.log("Successfully created dedication with ID:", testDed.id);
    
    // Clean up
    await prisma.dedicatoria.delete({
      where: { id: testDed.id }
    });
    console.log("Cleaned up test record.");
  } catch (err) {
    console.error("Prisma test failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
