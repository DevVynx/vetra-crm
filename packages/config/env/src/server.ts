import { requireEnv } from "./requireEnv";

export type ServerConfig = {
  NODE_ENV: "development" | "production" | "test";
  API_PORT: number;
  FRONTEND_URL: string;
  DATABASE_URL: string;
};

function load(): ServerConfig {
  return {
    NODE_ENV: (process.env.NODE_ENV ?? "development") as ServerConfig["NODE_ENV"],
    API_PORT: Number(process.env.API_PORT ?? 8000),
    FRONTEND_URL: requireEnv("FRONTEND_URL"),
    DATABASE_URL: requireEnv("DATABASE_URL"),
  };
}

let cached: ServerConfig | null = null;

export const envConfig = {
  get(): ServerConfig {
    if (!cached) cached = load();
    return cached;
  },

  set(overrides: Partial<ServerConfig>) {
    const base = cached ?? load();
    cached = { ...base, ...overrides };
  },

  reset() {
    cached = null;
  },
};
