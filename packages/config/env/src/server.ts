import { requireEnv } from "./requireEnv";

export type ServerConfig = {
  NODE_ENV: "development" | "production" | "test";
  API_PORT: number;
  FRONTEND_URL: string;
  DATABASE_URL: string;
  STORAGE_DIR: string;
  // Where the API listens. 127.0.0.1 unless it runs in a container, where only 0.0.0.0 is reachable.
  API_HOST: string;
  // The built web, served by the API itself. Empty in development, where Vite serves it.
  WEB_DIST_DIR: string | null;
  // Applies the migrations when the server starts, from this folder. Only the container turns it on.
  AUTO_MIGRATE: boolean;
  MIGRATIONS_DIR: string | null;
  // The version this build is, written into the image when it is published. "dev" outside an image.
  VETRA_VERSION: string;
  // Where the published releases are listed, to tell the user a newer version exists.
  VETRA_RELEASES_URL: string;
};

const DEFAULT_RELEASES_URL = "https://api.github.com/repos/DevVynx/vetra-crm/releases?per_page=30";

function load(): ServerConfig {
  return {
    NODE_ENV: (process.env.NODE_ENV ?? "development") as ServerConfig["NODE_ENV"],
    API_PORT: Number(process.env.API_PORT ?? 8000),
    FRONTEND_URL: requireEnv("FRONTEND_URL"),
    DATABASE_URL: requireEnv("DATABASE_URL"),
    STORAGE_DIR: process.env.STORAGE_DIR ?? "storage",
    API_HOST: process.env.API_HOST ?? "127.0.0.1",
    WEB_DIST_DIR: process.env.WEB_DIST_DIR || null,
    AUTO_MIGRATE: process.env.AUTO_MIGRATE === "true",
    MIGRATIONS_DIR: process.env.MIGRATIONS_DIR || null,
    VETRA_VERSION: process.env.VETRA_VERSION || "dev",
    VETRA_RELEASES_URL: process.env.VETRA_RELEASES_URL || DEFAULT_RELEASES_URL,
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
