import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // No demo invoices: all invoices require a signed-in user (userId).
  // Run migrations first; seed only ensures DB is ready.
  console.log("Seed: database ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
