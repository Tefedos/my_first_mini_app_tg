export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }

  interface TelegramWebApp {
    initData: string;
    initDataUnsafe: TelegramWebAppInitDataUnsafe;
    version: string;
    platform: string;
    colorScheme: "light" | "dark";
    ready: () => void;
    expand: () => void;
    close: () => void;
    HapticFeedback?: {
      impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
      notificationOccurred: (type: "error" | "success" | "warning") => void;
      selectionChanged: () => void;
    };
  }

  interface TelegramWebAppInitDataUnsafe {
    auth_date?: number;
    chat?: TelegramWebAppChat;
    chat_instance?: string;
    chat_type?: string;
    hash?: string;
    query_id?: string;
    start_param?: string;
    user?: TelegramWebAppUser;
  }

  interface TelegramWebAppUser {
    id: number;
    is_bot?: boolean;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
  }

  interface TelegramWebAppChat {
    id: number;
    type: string;
    title?: string;
    username?: string;
    photo_url?: string;
  }
}
