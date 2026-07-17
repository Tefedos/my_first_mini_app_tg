import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import {
  TelegramAuthError,
  validateTelegramInitData,
} from "@/lib/telegram";

export const runtime = "nodejs";

const authRequestSchema = z.object({
  initData: z.string().min(1),
});

export async function POST(request: Request) {
  const payload = authRequestSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  try {
    const { TELEGRAM_BOT_TOKEN } = getServerEnv();
    const initData = validateTelegramInitData(
      payload.data.initData,
      TELEGRAM_BOT_TOKEN,
    );

    const telegramUser = await prisma.telegramUser.upsert({
      where: { telegramId: BigInt(initData.user.id) },
      create: {
        telegramId: BigInt(initData.user.id),
        username: initData.user.username,
        firstName: initData.user.first_name,
        lastName: initData.user.last_name,
        languageCode: initData.user.language_code,
        isPremium: initData.user.is_premium ?? false,
        photoUrl: initData.user.photo_url,
        lastSeenAt: new Date(),
      },
      update: {
        username: initData.user.username,
        firstName: initData.user.first_name,
        lastName: initData.user.last_name,
        languageCode: initData.user.language_code,
        isPremium: initData.user.is_premium ?? false,
        photoUrl: initData.user.photo_url,
        lastSeenAt: new Date(),
      },
    });

    const telegramChat = initData.chat
      ? await prisma.telegramChat.upsert({
          where: { telegramId: BigInt(initData.chat.id) },
          create: {
            telegramId: BigInt(initData.chat.id),
            type: initData.chat.type,
            title: initData.chat.title,
            username: initData.chat.username,
          },
          update: {
            type: initData.chat.type,
            title: initData.chat.title,
            username: initData.chat.username,
          },
        })
      : null;

    if (telegramChat) {
      await prisma.telegramChatMember.upsert({
        where: {
          userId_chatId: {
            userId: telegramUser.id,
            chatId: telegramChat.id,
          },
        },
        create: {
          userId: telegramUser.id,
          chatId: telegramChat.id,
        },
        update: {},
      });
    }

    await prisma.miniAppSession.upsert({
      where: { initDataHash: initData.hash },
      create: {
        userId: telegramUser.id,
        telegramUserId: BigInt(initData.user.id),
        chatType: initData.chatType,
        chatInstance: initData.chatInstance,
        initDataHash: initData.hash,
        authDate: initData.authDate,
      },
      update: {},
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: telegramUser.id,
        telegramId: telegramUser.telegramId.toString(),
        username: telegramUser.username,
        firstName: telegramUser.firstName,
        lastName: telegramUser.lastName,
      },
      chat: telegramChat
        ? {
            id: telegramChat.id,
            telegramId: telegramChat.telegramId.toString(),
            title: telegramChat.title,
            type: telegramChat.type,
          }
        : null,
      launch: {
        chatInstance: initData.chatInstance,
        chatType: initData.chatType,
      },
    });
  } catch (error) {
    if (error instanceof TelegramAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error(error);
    return NextResponse.json({ error: "Telegram auth failed" }, { status: 500 });
  }
}
