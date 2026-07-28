import { startPrismaDevServer } from "@prisma/dev";
import { spawn } from "node:child_process";

const debug = process.env.PRISMA_DEV_DEBUG === "1";
const databasePort = Number(process.env.PRISMA_DEV_DATABASE_PORT ?? 51214);
const serverPort = Number(process.env.PRISMA_DEV_SERVER_PORT ?? 51213);
const shadowDatabasePort = Number(
  process.env.PRISMA_DEV_SHADOW_DATABASE_PORT ?? 51215,
);
const shouldAutoSetup = process.env.PRISMA_DEV_AUTO_SETUP === "1";
const preferredPersistenceMode =
  process.env.PRISMA_DEV_PERSISTENCE === "stateless" ? "stateless" : "stateful";

let server;
let activePersistenceMode = preferredPersistenceMode;
let isClosing = false;

try {
  server = await startServer(activePersistenceMode);
} catch (error) {
  if (
    preferredPersistenceMode === "stateful" &&
    error instanceof Error &&
    error.message.includes("PGlite failed to initialize properly")
  ) {
    console.error("Stateful Prisma dev database failed to start.");
    console.error("Trying a temporary stateless database instead...");
    activePersistenceMode = "stateless";

    try {
      server = await startServer(activePersistenceMode);
    } catch (fallbackError) {
      fail(fallbackError);
    }
  } else {
    fail(error);
  }
}

console.log("Prisma dev database is running.");
console.log(`Persistence mode: ${activePersistenceMode}`);
console.log(`Database: ${server.database.connectionString}`);
console.log(`Prisma ORM: ${server.database.prismaORMConnectionString}`);
console.log(`HTTP: ${server.http.url}`);
console.log("Keep this terminal open while the app is running.");

if (activePersistenceMode === "stateless") {
  console.log(
    shouldAutoSetup
      ? "This database is temporary. Schema and seed data will be recreated now."
      : "This database is temporary. Run `npm run db:setup` in another terminal.",
  );
}

if (shouldAutoSetup) {
  try {
    await run("npm", ["run", "db:setup"], {
      DATABASE_URL:
        server.database.prismaORMConnectionString ??
        server.database.connectionString,
    });
  } catch (error) {
    console.error("Database setup failed.");
    console.error(error instanceof Error ? error.message : error);
    await close("setup failure", 1);
  }

  console.log("Database schema and seed data are ready.");
}

async function close(signal, exitCode = 0) {
  if (isClosing) {
    return;
  }

  isClosing = true;
  console.log(`${signal} received, stopping Prisma dev database...`);
  await server.close();
  process.exit(exitCode);
}

process.on("SIGINT", () => {
  void close("SIGINT");
});

process.on("SIGTERM", () => {
  void close("SIGTERM");
});

await new Promise(() => {});

function startServer(persistenceMode) {
  return startPrismaDevServer({
    databasePort,
    debug,
    name: "default",
    persistenceMode,
    port: serverPort,
    shadowDatabasePort,
  });
}

function fail(error) {
  console.error("Failed to start Prisma dev database.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

function run(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: {
        ...process.env,
        ...env,
      },
      shell: false,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}
