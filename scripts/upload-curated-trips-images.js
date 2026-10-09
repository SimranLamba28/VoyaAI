import "dotenv/config";
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL,
});

const prisma = new PrismaClient({ adapter });

const tripsRoot = path.join(
  process.cwd(),
  "public/images/trips"
);

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

function getDayNumber(fileName) {
  const match = fileName.match(/day[-_]?(\d+)/i);

  return match ? Number(match[1]) : null;
}

async function uploadImage(filePath, publicId) {
  return cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    resource_type: "image",
  });
}

async function main() {
  if (!fs.existsSync(tripsRoot)) {
    console.log(`Trips folder not found: ${tripsRoot}`);
    return;
  }

  const countries = fs
    .readdirSync(tripsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  for (const country of countries) {
    const countryPath = path.join(
      tripsRoot,
      country.name
    );

    const tripFolders = fs
      .readdirSync(countryPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory());

    for (const tripFolder of tripFolders) {
      const tripSlug = slugify(tripFolder.name);

      console.log(`\nProcessing trip: ${tripFolder.name}`);
      console.log(`Slug: ${tripSlug}`);

      const trip = await prisma.curatedTrip.findUnique({
        where: {
          slug: tripSlug,
        },
        include: {
          itinerary: true,
        },
      });

      if (!trip) {
        console.log(
          `No CuratedTrip found in database for "${tripSlug}". Skipping.`
        );
        continue;
      }

      if (!trip.itinerary) {
        console.log(
          `No itinerary found for "${tripSlug}". Skipping.`
        );
        continue;
      }

      const tripPath = path.join(
        countryPath,
        tripFolder.name
      );

      const files = fs
        .readdirSync(tripPath, { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .filter((entry) =>
          /\.(jpg|jpeg|png|webp)$/i.test(entry.name)
        );

      for (const file of files) {
        const dayNumber = getDayNumber(file.name);

        if (!dayNumber) {
          console.log(
            `Could not determine day number from: ${file.name}`
          );
          continue;
        }

        const itineraryDay =
          await prisma.itineraryDay.findUnique({
            where: {
              itineraryId_dayNumber: {
                itineraryId: trip.itinerary.id,
                dayNumber,
              },
            },
          });

        if (!itineraryDay) {
          console.log(
            `Day ${dayNumber} not found in DB for ${tripSlug}. Skipping.`
          );
          continue;
        }

        if (itineraryDay.imageUrl) {
          console.log(
            `Day ${dayNumber} already has an image. Skipping.`
          );
          continue;
        }

        const filePath = path.join(
          tripPath,
          file.name
        );

        const publicId =
          `voyaai/curated-trips/${tripSlug}/day-${dayNumber}`;

        console.log(
          `Uploading ${file.name} → ${publicId}`
        );

        const result = await uploadImage(
          filePath,
          publicId
        );

        await prisma.itineraryDay.update({
          where: {
            id: itineraryDay.id,
          },
          data: {
            imageUrl: result.secure_url,
            imagePublicId: result.public_id,
          },
        });

        console.log(
          `✓ Day ${dayNumber} complete`
        );
      }
    }
  }
}

main()
  .catch((error) => {
    console.error("Upload failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });