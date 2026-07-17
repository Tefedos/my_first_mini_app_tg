import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { userProfileSelect } from "@/lib/user-profile";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ user_id: string }> },
) {
  try {
    const { user_id } = await params;
    const userId = Number(user_id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Invalid user id" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userProfileSelect,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    return apiErrorResponse("Failed to load profile", error);
  }
}
