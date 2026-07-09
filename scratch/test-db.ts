import "dotenv/config";
import { Pool } from "pg";

async function testPool(name: string, connectionString: string) {
  console.log(`\n--- Testing ${name} ---`);
  if (!connectionString) {
    console.error(`${name}: Connection string is empty!`);
    return;
  }
  console.log(`URL: ${connectionString.replace(/:[^:@]+@/, ":****@")}`); // mask password
  
  const pool = new Pool({ connectionString });
  try {
    const client = await pool.connect();
    console.log(`${name}: Socket connected successfully!`);
    const res = await client.query("SELECT NOW()");
    console.log(`${name}: Query success! DB Time:`, res.rows[0].now);
    client.release();
  } catch (error: any) {
    console.error(`${name}: Connection failed:`, error.message || error);
  } finally {
    await pool.end();
  }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || "";
  const directUrl = process.env.DIRECT_URL || "";

  await testPool("DATABASE_URL (Port 6543 / Pooler)", dbUrl);
  await testPool("DIRECT_URL (Port 5432 / Direct)", directUrl);
}

main();
