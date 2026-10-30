import { parseEnv } from "@neon/env";
import { createNeonAuth } from "@neondatabase/auth/next/server";
import config from "../../../neon";

const env = parseEnv(config, ["NEON_AUTH_BASE_URL"]);

export const auth = createNeonAuth({
  baseUrl: env.auth.baseUrl,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
});
