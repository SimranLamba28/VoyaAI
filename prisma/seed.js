require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");

const destinations = require("./data/destinations.json");
const curatedTrips = require("./data/curated-trips.json");

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

     // Seed curated trips
     for (const trip of curatedTrips) {
      const destination = await prisma.destination.findUnique({
        where: {
          slug: trip.destinationSlug,
        },
      });

      if (!destination) {
        throw new Error(
          `Destination not found: ${trip.destinationSlug}`,
        );
      }

      await prisma.curatedTrip.upsert({
        where: {
          slug: trip.slug,
        },
        update: {
          title: trip.title,
          destinationId: destination.id,
          location: trip.location,
          description: trip.description,
          image: trip.image,
          altText: trip.altText,
          duration: trip.duration,
          budgetMin: trip.budgetMin,
          budgetMax: trip.budgetMax,
          currency: trip.currency,
          featured: trip.featured,
          displayOrder: trip.displayOrder,
        },
        create: {
          slug: trip.slug,
          title: trip.title,
          destinationId: destination.id,
          location: trip.location,
          description: trip.description,
          image: trip.image,
          altText: trip.altText,
          duration: trip.duration,
          budgetMin: trip.budgetMin,
          budgetMax: trip.budgetMax,
          currency: trip.currency,
          featured: trip.featured,
          displayOrder: trip.displayOrder,
        },
      });
    }
    console.log("Curated trips seeded successfully!");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
