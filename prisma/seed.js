require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");

const destinations = require("./data/destinations.json");

async function main() {
  const { PrismaClient } = await import("../generated/prisma/client.ts");

  const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    for (const destination of destinations) {
        await prisma.destination.upsert({
            where: {
              slug: destination.slug,
            },
            update: destination,
            create: destination,
        });
    }

    console.log("Destinations seeded successfully!");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
