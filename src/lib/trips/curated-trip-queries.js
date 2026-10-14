import { prisma } from "@/lib/prisma";

const plannerInclude = {
  destination: true,
};

const detailInclude = {
  destination: true,
  media: true,
  itinerary: {
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
      },
    },
  },
};

export async function getCuratedTripBySlug(slug, { forPlanner = false } = {}) {
  return prisma.curatedTrip.findUnique({
    where: { slug },
    include: forPlanner ? plannerInclude : detailInclude,
  });
}
