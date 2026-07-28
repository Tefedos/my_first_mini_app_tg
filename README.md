# Telegram Group Mini App

Стартовый проект mini app для Telegram-группы на Next.js, React, TypeScript и Postgres.

## Что внутри

- Next.js App Router + React + TypeScript
- Tailwind CSS
- Prisma 7 + Postgres
- Проверка Telegram WebApp `initData` на сервере
- API endpoint `POST /api/telegram/auth`
- Модели для Telegram users, chats, memberships и mini app sessions
- Локальный Postgres через `prisma dev`

## Что понадобится

- Node.js 22+
- npm
- Postgres через Prisma dev или Docker
- Telegram bot token из BotFather
- Публичный HTTPS URL для запуска внутри Telegram: например Vercel, Cloudflare Tunnel или ngrok

## Быстрый старт

```bash
npm install
cp .env.example .env
```

Заполните `TELEGRAM_BOT_TOKEN` в `.env`.

Поднять локальный Postgres без Docker:

```bash
npm run db:dev
```

Эта команда запускает локальную базу и должна оставаться открытой в отдельном терминале.

Во втором терминале примените схему, сгенерируйте Prisma Client и заполните справочники:

```bash
npm run db:setup
```

Запустить приложение:

```bash
npm run dev -- -p 3001
```

Локально приложение откроется на `http://localhost:3001`.

Если понадобится вариант через Docker, поменяйте `DATABASE_URL` в `.env` на Docker-строку из `.env.example`, затем выполните:

```bash
npm run db:setup:docker
```

## Telegram setup

1. Создайте бота в BotFather и положите token в `TELEGRAM_BOT_TOKEN`.
2. Задеплойте приложение или пробросьте локальный dev server в HTTPS URL.
3. Укажите публичный URL mini app в настройках бота.
4. Добавьте бота в нужную группу и открывайте mini app из Telegram, чтобы клиент получил подписанный `initData`.

Если используете временный Cloudflare Tunnel, после получения нового URL обновите кнопку бота:

```bash
npm run telegram:set-menu -- https://your-current-tunnel.trycloudflare.com/registration
```

Важно: это должна быть именно WebApp-кнопка Telegram, а не обычная URL-кнопка. Иначе приложение может открыться без подписанного `initData`, и привязка пользователя к Telegram-аккаунту не сработает.

Официальная документация:

- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [Validating data received via the Mini App](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)

## Полезные команды

```bash
npm run lint
npm run build
npm run db:push
npm run db:migrate
npm run db:studio
npm run db:setup
npm run db:setup:docker
```

## Важные файлы

- `src/components/mini-app-shell.tsx` - клиентский экран Telegram mini app
- `src/app/api/telegram/auth/route.ts` - серверная авторизация Telegram launch data
- `src/lib/telegram.ts` - HMAC-проверка `initData`
- `src/lib/prisma.ts` - Prisma Client singleton
- `prisma/schema.prisma` - схема Postgres
