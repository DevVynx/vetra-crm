import { requireEnv } from "./requireEnv";

export type WahaConfig = {
  WAHA_URL: string;
  WAHA_API_KEY: string;
};

function load(): WahaConfig {
  return {
    WAHA_URL: requireEnv("WAHA_URL"),
    WAHA_API_KEY: requireEnv("WAHA_API_KEY"),
  };
}

let cached: WahaConfig | null = null;

export const envConfig = {
  get(): WahaConfig {
    if (!cached) cached = load();
    return cached;
  },

  set(overrides: Partial<WahaConfig>) {
    const base = cached ?? load();
    cached = { ...base, ...overrides };
  },

  reset() {
    cached = null;
  },
};
