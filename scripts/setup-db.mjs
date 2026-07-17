import "dotenv/config";
import { spawn } from "node:child_process";
import { Client } from "pg";

const WAIT_ATTEMPTS = 30;
const WAIT_DELAY_MS = 1000;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  await run("docker", ["compose", "up", "-d"]);
  await waitForDatabase();
  await run("npx", ["prisma", "db", "push"]);
  await run("node", ["scripts/seed-dota.mjs"]);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
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

async function waitForDatabase() {
  for (let attempt = 1; attempt <= WAIT_ATTEMPTS; attempt += 1) {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: WAIT_DELAY_MS,
    });

    try {
      await client.connect();
      await client.query("select 1");
      await client.end();
      console.log("Postgres is ready.");
      return;
    } catch (error) {
      await client.end().catch(() => {});

      if (attempt === WAIT_ATTEMPTS) {
        throw error;
      }

      console.log(`Waiting for Postgres... ${attempt}/${WAIT_ATTEMPTS}`);
      await delay(WAIT_DELAY_MS);
    }
  }
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
