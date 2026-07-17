import crypto from "node:crypto";
import { z } from "zod";

const telegramUserSchema = z.object({
  id: z.number().int(),
  is_bot: z.boolean().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  language_code: z.string().optional(),
  is_premium: z.boolean().optional(),
  photo_url: z.string().optional(),
});

const telegramChatSchema = z.object({
  id: z.number().int(),
  type: z.string(),
  title: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
});

export type TelegramInitDataUser = z.infer<typeof telegramUserSchema>;
export type TelegramInitDataChat = z.infer<typeof telegramChatSchema>;

export type ValidatedTelegramInitData = {
  authDate: Date;
  chat?: TelegramInitDataChat;
  chatInstance?: string;
  chatType?: string;
  hash: string;
  user: TelegramInitDataUser;
};

export class TelegramAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TelegramAuthError";
  }
}

export function validateTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 60 * 60 * 24,
): ValidatedTelegramInitData {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");

  if (!hash) {
    throw new TelegramAuthError("Telegram initData hash is missing");
  }

  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (!timingSafeEqualHex(calculatedHash, hash)) {
    throw new TelegramAuthError("Telegram initData hash is invalid");
  }

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate)) {
    throw new TelegramAuthError("Telegram initData auth_date is invalid");
  }

  const authDateMs = authDate * 1000;
  const now = Date.now();
  if (authDateMs - now > 60_000) {
    throw new TelegramAuthError("Telegram initData auth_date is in the future");
  }

  if (maxAgeSeconds > 0 && now - authDateMs > maxAgeSeconds * 1000) {
    throw new TelegramAuthError("Telegram initData is expired");
  }

  const user = parseJsonParam(params, "user", telegramUserSchema);
  if (!user) {
    throw new TelegramAuthError("Telegram initData user is missing");
  }

  return {
    authDate: new Date(authDateMs),
    chat: parseJsonParam(params, "chat", telegramChatSchema),
    chatInstance: params.get("chat_instance") ?? undefined,
    chatType: params.get("chat_type") ?? undefined,
    hash,
    user,
  };
}

function parseJsonParam<T extends z.ZodType>(
  params: URLSearchParams,
  key: string,
  schema: T,
): z.infer<T> | undefined {
  const value = params.get(key);
  if (!value) {
    return undefined;
  }

  try {
    return schema.parse(JSON.parse(value));
  } catch {
    throw new TelegramAuthError(`Telegram initData ${key} is invalid`);
  }
}

function timingSafeEqualHex(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.byteLength !== rightBuffer.byteLength) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}
