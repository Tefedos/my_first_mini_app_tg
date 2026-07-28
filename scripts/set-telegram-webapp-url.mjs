#!/usr/bin/env node

import { readFileSync } from "node:fs";

const DEFAULT_WEB_APP_PATH = "/registration";

function readEnvFile(path) {
  try {
    const content = readFileSync(path, "utf8");
    const values = {};

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      values[key] = value;
    }

    return values;
  } catch {
    return {};
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const env = {
  ...readEnvFile(".env"),
  ...process.env,
};

const botToken = env.TELEGRAM_BOT_TOKEN?.trim();
const rawUrl = process.argv[2]?.trim() || env.NEXT_PUBLIC_APP_URL?.trim();
const buttonText = process.argv[3]?.trim() || "Открыть mini app";

if (!botToken || botToken.includes("replace-with")) {
  fail("TELEGRAM_BOT_TOKEN is missing in .env");
}

if (!rawUrl) {
  fail("Pass a public HTTPS URL or set NEXT_PUBLIC_APP_URL in .env");
}

let webAppUrl;

try {
  webAppUrl = new URL(rawUrl);
} catch {
  fail(`Invalid URL: ${rawUrl}`);
}

if (webAppUrl.protocol !== "https:") {
  fail("Telegram Mini App URL must use https://");
}

if (webAppUrl.pathname === "/") {
  webAppUrl.pathname = DEFAULT_WEB_APP_PATH;
}

const response = await fetch(
  `https://api.telegram.org/bot${botToken}/setChatMenuButton`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      menu_button: {
        type: "web_app",
        text: buttonText,
        web_app: {
          url: webAppUrl.toString(),
        },
      },
    }),
  },
);

const result = await response.json().catch(() => null);

if (!response.ok || result?.ok === false) {
  fail(result?.description || `Telegram API failed with status ${response.status}`);
}

console.log(`Telegram WebApp menu URL updated: ${webAppUrl.toString()}`);
