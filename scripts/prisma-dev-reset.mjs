import { existsSync } from "node:fs";
import { mkdir, readdir, rename } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const stamp = new Date()
  .toISOString()
  .replaceAll(":", "-")
  .replaceAll(".", "-");

const dataRoot = getPrismaDevDataRoot();
const statePaths = [
  join(dataRoot, "default"),
  join(dataRoot, "durable-streams", "default"),
];
const backupRoot = join(dataRoot, ".backups", stamp);

let movedCount = 0;

await moveVisibleBackups(dataRoot, "root");
await moveVisibleBackups(join(dataRoot, "durable-streams"), "durable-streams");

for (const statePath of statePaths) {
  if (!existsSync(statePath)) {
    continue;
  }

  const backupPath = join(backupRoot, statePathToBackupName(statePath));
  await mkdir(backupRoot, { recursive: true });
  await rename(statePath, backupPath);
  movedCount += 1;
  console.log(`Moved ${statePath}`);
  console.log(`  to ${backupPath}`);
}

if (movedCount === 0) {
  console.log(`No Prisma dev state found in ${dataRoot}`);
} else {
  console.log("Prisma dev state was backed up. Start the database again with `npm run db:dev`.");
}

function getPrismaDevDataRoot() {
  const appName = "prisma-dev-nodejs";

  if (process.platform === "darwin") {
    return join(homedir(), "Library", "Application Support", appName);
  }

  if (process.platform === "win32") {
    return join(process.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local"), appName, "Data");
  }

  return join(
    process.env.XDG_DATA_HOME ?? join(homedir(), ".local", "share"),
    appName,
  );
}

async function moveVisibleBackups(parentPath, label) {
  if (!existsSync(parentPath)) {
    return;
  }

  const entries = await readdir(parentPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.includes(".backup-")) {
      continue;
    }

    const sourcePath = join(parentPath, entry.name);
    const backupPath = join(backupRoot, `${label}-${entry.name}`);

    await mkdir(backupRoot, { recursive: true });
    await rename(sourcePath, backupPath);
    movedCount += 1;
    console.log(`Moved old visible backup ${sourcePath}`);
    console.log(`  to ${backupPath}`);
  }
}

function statePathToBackupName(statePath) {
  return statePath.replace(dataRoot, "").replaceAll("/", "__").replaceAll("\\", "__");
}
