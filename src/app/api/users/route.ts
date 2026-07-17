import { NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { upsertTelegramAccountFromInitData } from "@/lib/telegram-account";
import { TelegramAuthError } from "@/lib/telegram";

export const runtime = "nodejs";

const createUserRequestSchema = z.object({
  avatarId: z.number().int().positive(),
  initData: z.string().optional(),
  loveHeroId: z.number().int().positive(),
  lovePosId: z.number().int().positive(),
  name: z.string().trim().min(1, "Name is required").max(32),
});

export async function POST(request: Request) {
  const payload = createUserRequestSchema.safeParse(
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
    const { avatarId, initData, loveHeroId, lovePosId, name } = payload.data;
    const [avatar, hero, postion] = await prisma.$transaction([
      prisma.avatar.findUnique({ where: { id: avatarId }, select: { id: true } }),
      prisma.hero.findUnique({ where: { id: loveHeroId }, select: { id: true } }),
      prisma.postion.findUnique({ where: { id: lovePosId }, select: { id: true } }),
    ]);

    const missingFields: Record<string, string[]> = {};

    if (!avatar) {
      missingFields.avatarId = ["Avatar not found"];
    }

    if (!hero) {
      missingFields.loveHeroId = ["Hero not found"];
    }

    if (!postion) {
      missingFields.lovePosId = ["Postion not found"];
    }

    if (Object.keys(missingFields).length > 0) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: missingFields,
        },
        { status: 400 },
      );
    }

    const telegramAccount = initData?.trim()
      ? await upsertTelegramAccountFromInitData(initData)
      : null;
    const accountId = telegramAccount?.telegramUser.id ?? null;

    const user = await prisma.user.create({
      data: {
        accountId,
        avatarId,
        coins: 1000,
        loveHeroId,
        lovePosId,
        name,
      },
      select: {
        accountId: true,
        avatarId: true,
        coins: true,
        id: true,
        loveHeroId: true,
        lovePosId: true,
        name: true,
      },
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (error) {
    if (error instanceof TelegramAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return apiErrorResponse("Failed to create user", error);
  }
}
