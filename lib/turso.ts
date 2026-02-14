import { createClient } from "@libsql/client";
import { requireEnv } from "./env";

const url = requireEnv("TURSO_DATABASE_URL");
const authToken = requireEnv("TURSO_AUTH_TOKEN");

export const db = createClient({
  url,
  authToken,
});
