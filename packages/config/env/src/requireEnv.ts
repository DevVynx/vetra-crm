export function requireEnv(key: string): string {
  const value = process.env[key];

  if (!value || value.trim() === "") {
    throw new Error(`Env ${key} is empty or not defined`);
  }

  return value;
}
