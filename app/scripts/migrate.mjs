import postgres from "postgres";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.log("No DATABASE_URL set, skipping migrations.");
  process.exit(0);
}

const sql = postgres(DATABASE_URL, { max: 1 });

async function migrate() {
  // Create migrations tracking table
  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      id serial PRIMARY KEY,
      name text NOT NULL UNIQUE,
      applied_at timestamp DEFAULT now()
    )
  `;

  // Find migration files
  const migrationsDir = join(process.cwd(), "drizzle");
  let files;
  try {
    files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();
  } catch {
    console.log("No drizzle/ directory found, skipping.");
    await sql.end();
    return;
  }

  for (const file of files) {
    // Check if already applied
    const [existing] = await sql`
      SELECT id FROM _migrations WHERE name = ${file}
    `;
    if (existing) {
      console.log(`  skip: ${file} (already applied)`);
      continue;
    }

    // Read and execute
    const content = readFileSync(join(migrationsDir, file), "utf8");
    const statements = content
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    console.log(`  applying: ${file} (${statements.length} statements)`);
    for (const stmt of statements) {
      await sql.unsafe(stmt);
    }

    // Record
    await sql`INSERT INTO _migrations (name) VALUES (${file})`;
    console.log(`  done: ${file}`);
  }

  await sql.end();
}

console.log("Running database migrations...");
migrate()
  .then(() => console.log("Migrations complete."))
  .catch((err) => {
    console.error("Migration error:", err.message);
    process.exit(0); // Don't crash the container
  });
