import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-error";
import { getServerEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { TelegramAuthError, validateTelegramInitData } from "@/lib/telegram";
import { userProfileSelect } from "@/lib/user-profile";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const initData = request.headers.get("x-telegram-init-data")?.trim();

  if (!initData) {
    return NextResponse.json(
      { error: "Telegram initData is required" },
      { status: 400 },
    );
  }

  try {
    const { TELEGRAM_BOT_TOKEN } = getServerEnv();
    const telegramInitData = validateTelegramInitData(
      initData,
      TELEGRAM_BOT_TOKEN,
    );

    const telegramUser = await prisma.telegramUser.findUnique({
      where: { telegramId: BigInt(telegramInitData.user.id) },
      select: { id: true },
    });

    if (!telegramUser) {
      return NextResponse.json(
        { error: "Telegram user not found", user: null },
        { status: 404 },
      );
    }

    const user = await prisma.user.findFirst({
      where: { accountId: telegramUser.id },
      orderBy: { id: "desc" },
      select: userProfileSelect,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Profile not found", user: null },
        { status: 404 },
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof TelegramAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return apiErrorResponse("Failed to check Telegram profile", error);
  }
}
