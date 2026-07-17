import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const avatars = await prisma.avatar.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        avatarsUrl: true,
      },
    });

    return NextResponse.json({ avatars });
  } catch (error) {
    return apiErrorResponse("Failed to load avatars", error);
  }
}
