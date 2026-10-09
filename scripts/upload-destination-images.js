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

const destinationsRoot = path.join(
  process.cwd(),
  "public/images/destinations"
);

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\.[^/.]+$/, "")
    .replace(/\s+/g, "-");
}

async function main() {
  if (!fs.existsSync(destinationsRoot)) {
    console.log(
      `Destinations folder not found: ${destinationsRoot}`
    );
    return;
  }

  const files = fs
    .readdirSync(destinationsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) =>
      /\.(jpg|jpeg|png|webp)$/i.test(entry.name)
    );

  for (const file of files) {
    const filePath = path.join(
      destinationsRoot,
      file.name
    );

    const slug = slugify(file.name);

    console.log(`\nProcessing: ${file.name}`);
    console.log(`Destination slug: ${slug}`);

    const destination = await prisma.destination.findUnique({
      where: {
        slug,
      },
    });

    if (!destination) {
      console.log(
        `No destination found in database for "${slug}". Skipping.`
      );
      continue;
    }

    if (destination.heroImageUrl) {
      console.log(
        "Destination already has an image. Skipping."
      );
      continue;
    }

    const publicId = `voyaai/destinations/${slug}`;

    console.log(`Uploading → ${publicId}`);

    const result = await cloudinary.uploader.upload(
      filePath,
      {
        public_id: publicId,
        resource_type: "image",
      }
    );

    await prisma.destination.update({
      where: {
        id: destination.id,
      },
      data: {
        heroImageUrl: result.secure_url,
        heroImagePublicId: result.public_id,
      },
    });

    console.log("✓ Upload complete");
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