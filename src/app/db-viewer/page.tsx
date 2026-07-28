import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type DbCell = string | number | boolean | null | Date | bigint;
type DbRow = Record<string, DbCell>;

type DbTable = {
  name: string;
  rows: DbRow[];
};

const LOCAL_HOST_PREFIXES = ["localhost", "127.0.0.1", "[::1]"];

function isLocalRequest(host: string) {
  return LOCAL_HOST_PREFIXES.some((prefix) => host.startsWith(prefix));
}

function formatCell(value: DbCell) {
  if (value === null) {
    return "NULL";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

function DbTableView({ table }: { table: DbTable }) {
  const columns = table.rows[0] ? Object.keys(table.rows[0]) : [];

  return (
    <section className="rounded-lg border border-slate-700 bg-slate-950/80 p-4 shadow-xl shadow-black/20">
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">{table.name}</h2>
        <span className="text-sm text-slate-400">{table.rows.length} rows</span>
      </div>

      {table.rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-700 px-3 py-4 text-sm text-slate-400">
          Записей пока нет
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    className="border-b border-slate-700 px-3 py-2 font-medium text-slate-300"
                    key={column}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr className="odd:bg-slate-900/50" key={`${table.name}-${rowIndex}`}>
                  {columns.map((column) => (
                    <td
                      className="max-w-[360px] border-b border-slate-800 px-3 py-2 text-slate-200"
                      key={column}
                    >
                      <span className="block truncate" title={formatCell(row[column])}>
                        {formatCell(row[column])}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

async function loadTables(): Promise<DbTable[]> {
  const [
    users,
    avatars,
    heroes,
    postions,
    telegramUsers,
    telegramChats,
    telegramChatMembers,
    miniAppSessions,
  ] = await prisma.$transaction([
    prisma.user.findMany({
      orderBy: { id: "desc" },
      select: {
        accountId: true,
        avatarId: true,
        coins: true,
        id: true,
        loveHeroId: true,
        lovePosId: true,
        name: true,
      },
    }),
    prisma.avatar.findMany({
      orderBy: { id: "asc" },
      select: {
        avatarsUrl: true,
        id: true,
      },
    }),
    prisma.hero.findMany({
      orderBy: { id: "asc" },
      select: {
        heroName: true,
        id: true,
      },
    }),
    prisma.postion.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        pos: true,
      },
    }),
    prisma.telegramUser.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        firstName: true,
        id: true,
        isPremium: true,
        languageCode: true,
        lastName: true,
        lastSeenAt: true,
        photoUrl: true,
        telegramId: true,
        updatedAt: true,
        username: true,
      },
    }),
    prisma.telegramChat.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        id: true,
        telegramId: true,
        title: true,
        type: true,
        updatedAt: true,
        username: true,
      },
    }),
    prisma.telegramChatMember.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        chatId: true,
        createdAt: true,
        id: true,
        role: true,
        updatedAt: true,
        userId: true,
      },
    }),
    prisma.miniAppSession.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        authDate: true,
        chatInstance: true,
        chatType: true,
        createdAt: true,
        id: true,
        initDataHash: true,
        telegramUserId: true,
        userId: true,
      },
    }),
  ]);

  return [
    { name: "users", rows: users },
    { name: "avatars", rows: avatars },
    { name: "heroes", rows: heroes },
    { name: "postion", rows: postions },
    { name: "telegram_users", rows: telegramUsers },
    { name: "telegram_chats", rows: telegramChats },
    { name: "telegram_chat_members", rows: telegramChatMembers },
    { name: "mini_app_sessions", rows: miniAppSessions },
  ];
}

export default async function DbViewerPage() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";

  if (process.env.NODE_ENV === "production" || !isLocalRequest(host)) {
    return (
      <main className="min-h-dvh bg-slate-950 px-5 py-10 text-slate-100">
        <section className="mx-auto max-w-2xl rounded-lg border border-slate-700 bg-slate-900 p-6">
          <h1 className="text-2xl font-semibold">DB Viewer недоступен</h1>
          <p className="mt-3 text-slate-300">
            Эта страница работает только локально на localhost в dev-режиме.
          </p>
        </section>
      </main>
    );
  }

  const tables = await loadTables();

  return (
    <main className="min-h-dvh bg-slate-950 px-5 py-8 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header>
          <p className="text-sm uppercase tracking-[0.16em] text-blue-300">
            Local only
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">DB Viewer</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            Временный просмотрщик таблиц для локальной разработки. Если нужно
            обновить данные, просто перезагрузи страницу.
          </p>
        </header>

        {tables.map((table) => (
          <DbTableView key={table.name} table={table} />
        ))}
      </div>
    </main>
  );
}
