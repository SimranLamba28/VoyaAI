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

const videosRoot = path.join(
  process.cwd(),
  "public/videos/trips"
);

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

function getPlacement(fileName) {
  const match = fileName.match(
    /before[-_]?day[-_]?(\d+)/i
  );

  if (!match) return null;

  return `before-day-${Number(match[1])}`;
}

async function uploadVideo(filePath, publicId) {
  return cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    resource_type: "video",
  });
}

async function main() {
  if (!fs.existsSync(videosRoot)) {
    console.log(`Videos folder not found: ${videosRoot}`);
    return;
  }

  const countries = fs
    .readdirSync(videosRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  for (const country of countries) {
    const countryPath = path.join(
      videosRoot,
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
      });

      if (!trip) {
        console.log(
          `No CuratedTrip found for "${tripSlug}". Skipping.`
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
          /\.(mp4|webm|mov)$/i.test(entry.name)
        );

      for (const file of files) {
        const placement = getPlacement(file.name);

        if (!placement) {
          console.log(
            `Could not determine placement from: ${file.name}`
          );
          continue;
        }

        const existingMedia =
          await prisma.tripMedia.findFirst({
            where: {
              curatedTripId: trip.id,
              placement,
            },
          });

        if (existingMedia) {
          console.log(
            `${placement} already exists. Skipping.`
          );
          continue;
        }

        const filePath = path.join(
          tripPath,
          file.name
        );

        const publicId =
          `voyaai/curated-trips/${tripSlug}/${placement}`;

        console.log(
          `Uploading ${file.name} → ${publicId}`
        );

        const result = await uploadVideo(
          filePath,
          publicId
        );

        await prisma.tripMedia.create({
          data: {
            curatedTripId: trip.id,
            type: "video",
            placement,
            url: result.secure_url,
            publicId: result.public_id,
          },
        });

        console.log(
          `✓ ${placement} complete`
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