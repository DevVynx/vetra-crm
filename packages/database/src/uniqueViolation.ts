type PostgresError = { code?: unknown; constraint?: unknown; cause?: unknown };

const UNIQUE_VIOLATION = "23505";
const MAX_CAUSE_DEPTH = 3;

// Drizzle wraps the driver's error, so the Postgres code can sit a level or two down.
export function isUniqueViolation(error: unknown, constraint: string): boolean {
  let current = error;

  for (let depth = 0; depth < MAX_CAUSE_DEPTH && current && typeof current === "object"; depth++) {
    const { code, constraint: violated, cause } = current as PostgresError;
    if (code === UNIQUE_VIOLATION && violated === constraint) return true;
    current = cause;
  }

  return false;
}
