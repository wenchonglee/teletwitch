import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

let connectionString = process.env["CONNECTION_STRING"];
if (!connectionString) {
  console.error("CONNECTION_STRING must be in env");
  process.exit(1);
}

// * import.meta.env will need $ to be escaped but using dotenv doesn't
connectionString = connectionString.replace("\\$", "$");
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

await migrate(db, { migrationsFolder: path.join(dirname(fileURLToPath(import.meta.url)), "./migrations") });
process.exit();
