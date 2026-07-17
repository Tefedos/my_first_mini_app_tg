import { NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const searchHeroesRequestSchema = z.object({
  name: z.string().trim().min(2, "Hero name must contain at least 2 symbols"),
});

export async function POST(request: Request) {
  const payload = searchHeroesRequestSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!payload.success) {
    return NextResponse.json(
      {
        error: "Invalid request payload",
        details: payload.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const heroes = await prisma.hero.findMany({
      where: {
        heroName: {
          contains: payload.data.name,
          mode: "insensitive",
        },
      },
      orderBy: { id: "asc" },
      select: {
        id: true,
        heroName: true,
      },
    });

    return NextResponse.json({ heroes });
  } catch (error) {
    return apiErrorResponse("Failed to search heroes", error);
  }
}
