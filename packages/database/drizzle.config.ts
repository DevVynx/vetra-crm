import { envConfig } from "@vetra/env/server";
import { defineConfig } from "drizzle-kit";

const { DATABASE_URL } = envConfig.get();

export default defineConfig({
  out: "./migrations",
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: { url: DATABASE_URL },
  casing: "snake_case",
});
