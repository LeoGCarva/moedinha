import "server-only";
import { parseEnv } from "@neon/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import config from "../../neon";
import * as schema from "./schema";

const { postgres } = parseEnv(config, ["DATABASE_URL"]);

// Conexão pooled (-pooler) para o tráfego da aplicação.
const pool = new Pool({ connectionString: postgres.databaseUrl });

export const db = drizzle(pool, { schema });
