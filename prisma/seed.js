require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");

const destinations = require("./data/destinations.json");
const curatedTrips = require("./data/curated-trips.json");
const itineraries = require("./data/itineraries.json");

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

    for (const itinerary of itineraries) {
      const trip = await prisma.curatedTrip.findUnique({
        where: {
          slug: itinerary.tripSlug,
        },
      });
    
      if (!trip) {
        throw new Error(
          `Curated trip not found: ${itinerary.tripSlug}`,
        );
      }
    
      const savedItinerary = await prisma.itinerary.upsert({
        where: {
          curatedTripId: trip.id,
        },
        update: {
          title: itinerary.title,
          description: itinerary.description,
        },
        create: {
          curatedTripId: trip.id,
          title: itinerary.title,
          description: itinerary.description,
        },
      });
    
      for (const day of itinerary.days) {
        await prisma.itineraryDay.upsert({
          where: {
            itineraryId_dayNumber: {
              itineraryId: savedItinerary.id,
              dayNumber: day.dayNumber,
            },
          },
          update: {
            title: day.title,
            description: day.description,
            image: day.image,
            activities: day.activities,
          },
          create: {
            itineraryId: savedItinerary.id,
            dayNumber: day.dayNumber,
            title: day.title,
            description: day.description,
            image: day.image,
            activities: day.activities,
          },
        });
      }
    }
    
    console.log("Itineraries seeded successfully!");

  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
