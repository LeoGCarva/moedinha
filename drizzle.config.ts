import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Migrations usam a conexão direta (sem pooler).
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED! },
  // Não tocar no schema gerenciado pelo Neon Auth.
  schemaFilter: ["public"],
});
