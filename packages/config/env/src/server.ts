export type ServerConfig = {
  NODE_ENV: "development" | "production" | "test";
  API_PORT: number;
  FRONTEND_URL: string;
  DATABASE_URL: string;
};

function load(): ServerConfig {
  const get = (key: string) => {
    const value = process.env[key];

    if (!value || value.trim() === "") {
      throw new Error(`Env ${key} is empty or not defined`);
    }

    return value;
  };

  return {
    NODE_ENV: (process.env.NODE_ENV ?? "development") as ServerConfig["NODE_ENV"],
    API_PORT: Number(process.env.API_PORT ?? 8000),
    FRONTEND_URL: get("FRONTEND_URL"),
    DATABASE_URL: get("DATABASE_URL"),
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
