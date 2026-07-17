import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const postions = await prisma.postion.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        pos: true,
      },
    });

    return NextResponse.json({ postions });
  } catch (error) {
    return apiErrorResponse("Failed to load postions", error);
  }
}
