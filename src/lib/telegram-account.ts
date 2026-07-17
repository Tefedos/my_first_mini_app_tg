import { getServerEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { validateTelegramInitData } from "@/lib/telegram";

export async function upsertTelegramAccountFromInitData(initData: string) {
  const { TELEGRAM_BOT_TOKEN } = getServerEnv();
  const telegramInitData = validateTelegramInitData(
    initData,
    TELEGRAM_BOT_TOKEN,
  );

  const telegramUser = await prisma.telegramUser.upsert({
    where: { telegramId: BigInt(telegramInitData.user.id) },
    create: {
      telegramId: BigInt(telegramInitData.user.id),
      username: telegramInitData.user.username,
      firstName: telegramInitData.user.first_name,
      lastName: telegramInitData.user.last_name,
      languageCode: telegramInitData.user.language_code,
      isPremium: telegramInitData.user.is_premium ?? false,
      photoUrl: telegramInitData.user.photo_url,
      lastSeenAt: new Date(),
    },
    update: {
      username: telegramInitData.user.username,
      firstName: telegramInitData.user.first_name,
      lastName: telegramInitData.user.last_name,
      languageCode: telegramInitData.user.language_code,
      isPremium: telegramInitData.user.is_premium ?? false,
      photoUrl: telegramInitData.user.photo_url,
      lastSeenAt: new Date(),
    },
  });

  const telegramChat = telegramInitData.chat
    ? await prisma.telegramChat.upsert({
        where: { telegramId: BigInt(telegramInitData.chat.id) },
        create: {
          telegramId: BigInt(telegramInitData.chat.id),
          type: telegramInitData.chat.type,
          title: telegramInitData.chat.title,
          username: telegramInitData.chat.username,
        },
        update: {
          type: telegramInitData.chat.type,
          title: telegramInitData.chat.title,
          username: telegramInitData.chat.username,
        },
      })
    : null;

  if (telegramChat) {
    await prisma.telegramChatMember.upsert({
      where: {
        userId_chatId: {
          chatId: telegramChat.id,
          userId: telegramUser.id,
        },
      },
      create: {
        chatId: telegramChat.id,
        userId: telegramUser.id,
      },
      update: {},
    });
  }

  await prisma.miniAppSession.upsert({
    where: { initDataHash: telegramInitData.hash },
    create: {
      authDate: telegramInitData.authDate,
      chatInstance: telegramInitData.chatInstance,
      chatType: telegramInitData.chatType,
      initDataHash: telegramInitData.hash,
      telegramUserId: BigInt(telegramInitData.user.id),
      userId: telegramUser.id,
    },
    update: {},
  });

  return {
    telegramChat,
    telegramInitData,
    telegramUser,
  };
}
