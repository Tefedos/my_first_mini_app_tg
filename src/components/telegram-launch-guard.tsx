"use client";

import Script from "next/script";
import { type ReactNode, useCallback, useEffect } from "react";

const TELEGRAM_WEB_APP_SCRIPT = "https://telegram.org/js/telegram-web-app.js";
const TELEGRAM_LAUNCH_CHECK_TIMEOUT_MS = 4000;

function getTelegramWebApp() {
  return window.Telegram?.WebApp;
}

function getTelegramInitData() {
  const initData = getTelegramWebApp()?.initData;

  return typeof initData === "string" ? initData.trim() : "";
}

function hasTelegramLaunchData() {
  return getTelegramInitData().length > 0;
}

function hasTelegramWebViewBridge() {
  const maybeTelegramWindow = window as typeof window & {
    TelegramWebviewProxy?: unknown;
    TelegramWebviewProxyProto?: unknown;
  };

  return Boolean(
    maybeTelegramWindow.TelegramWebviewProxy ||
      maybeTelegramWindow.TelegramWebviewProxyProto ||
      navigator.userAgent.includes("Telegram"),
  );
}

function isTelegramLaunch() {
  return hasTelegramLaunchData() || hasTelegramWebViewBridge();
}

function redirectToTelegramOnly() {
  if (window.location.pathname !== "/telegram-only") {
    window.location.replace("/telegram-only");
  }
}

export function TelegramLaunchGuard({ children }: { children: ReactNode }) {
  const verifyTelegramLaunch = useCallback(() => {
    const webApp = getTelegramWebApp();

    if (!isTelegramLaunch()) {
      return false;
    }

    webApp?.ready();
    webApp?.expand();
    return true;
  }, []);

  useEffect(() => {
    let isFinished = false;
    const startedAt = Date.now();

    function finishIfTelegramLaunchReady() {
      if (isFinished) {
        return;
      }

      isFinished = verifyTelegramLaunch();
    }

    const intervalId = window.setInterval(finishIfTelegramLaunchReady, 120);
    const timeoutId = window.setTimeout(() => {
      if (!isFinished && Date.now() - startedAt >= TELEGRAM_LAUNCH_CHECK_TIMEOUT_MS) {
        redirectToTelegramOnly();
      }
    }, TELEGRAM_LAUNCH_CHECK_TIMEOUT_MS);

    finishIfTelegramLaunchReady();

    return () => {
      isFinished = true;

      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [verifyTelegramLaunch]);

  return (
    <>
      {children}
      <Script
        src={TELEGRAM_WEB_APP_SCRIPT}
        strategy="afterInteractive"
        onError={() => {
          window.setTimeout(() => {
            if (!isTelegramLaunch()) {
              redirectToTelegramOnly();
            }
          }, 300);
        }}
        onReady={() => {
          verifyTelegramLaunch();
        }}
      />
    </>
  );
}
