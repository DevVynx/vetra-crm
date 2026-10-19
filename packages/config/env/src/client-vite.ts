export type ClientConfig = {
  NODE_ENV: "development" | "production" | "test";
  VITE_API_URL: string;
};

// Separate from server.ts on purpose: web-layer concerns (what the web app
// needs), not backend concerns (DATABASE_URL) — see ENV-CONFIG.md.
function load(): ClientConfig {
  const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};

  const get = (key: string) => {
    const value = env[key];

    if (!value || value.trim() === "") {
      throw new Error(`Env ${key} is empty or not defined`);
    }

    return value;
  };

  return {
    NODE_ENV: (env.MODE ?? "development") as ClientConfig["NODE_ENV"],
    VITE_API_URL: get("VITE_API_URL"),
  };
}

let cached: ClientConfig | null = null;

export const envConfig = {
  get(): ClientConfig {
    if (!cached) cached = load();
    return cached;
  },

  set(overrides: Partial<ClientConfig>) {
    const base = cached ?? load();
    cached = { ...base, ...overrides };
  },

  reset() {
    cached = null;
  },
};
