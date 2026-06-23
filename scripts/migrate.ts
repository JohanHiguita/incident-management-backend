/**
 * Applies SQL migrations from backend/migrations/ in filename order.
 * Safe to re-run: scripts use IF NOT EXISTS.
 */

import "dotenv/config";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;

const migrationsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../migrations",
);

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env");
  }

  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    throw new Error(`No migration files found in ${migrationsDir}`);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  console.log(`Applying ${files.length} migration(s)...`);

  try {
    for (const file of files) {
      const sql = await readFile(path.join(migrationsDir, file), "utf8");
      console.log(`  → ${file}`);
      await client.query(sql);
    }
  } finally {
    await client.end();
  }

  console.log("Migrations applied successfully.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Migration failed: ${message}`);
  process.exit(1);
});
