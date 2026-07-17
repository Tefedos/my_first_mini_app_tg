import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { upsertTelegramAccountFromInitData } from "@/lib/telegram-account";
import { TelegramAuthError } from "@/lib/telegram";
import { userProfileSelect } from "@/lib/user-profile";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const initData = request.headers.get("x-telegram-init-data")?.trim();
    const userId = Number(url.searchParams.get("userId"));
    const isDevelopment = process.env.NODE_ENV !== "production";

    const telegramAccount = initData
      ? await upsertTelegramAccountFromInitData(initData)
      : null;

    const user = await prisma.user.findFirst({
      where: telegramAccount
        ? { accountId: telegramAccount.telegramUser.id }
        : Number.isInteger(userId) && userId > 0 && isDevelopment
          ? { id: userId }
          : isDevelopment
            ? undefined
            : { id: -1 },
      orderBy: { id: "desc" },
      select: userProfileSelect,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: telegramAccount || isDevelopment ? 404 : 401 },
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof TelegramAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return apiErrorResponse("Failed to load profile", error);
  }
}
