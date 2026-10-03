import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");

  let take;
  if (limitParam !== null) {
    const limit = Number(limitParam);
    if (!Number.isInteger(limit) || limit <= 0) {
      return NextResponse.json(
        { error: "limit must be a positive integer" },
        { status: 400 },
      );
    }
    take = limit;
  }

  try {
    const destinations = await prisma.destination.findMany({
      orderBy: { name: "asc" },
      ...(take !== undefined && { take }),
    });

    return NextResponse.json(destinations);
  } catch (error) {
    console.error("Failed to fetch destinations:", error);
    return NextResponse.json(
      { error: "Failed to fetch destinations" },
      { status: 500 },
    );
  }
}
