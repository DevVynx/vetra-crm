import { envConfig } from "@vetra/env/server";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/node-postgres";

const { DATABASE_URL } = envConfig.get();

export const db = drizzle(DATABASE_URL, {
  schema,
  casing: "snake_case",
});

export type Database = typeof db;
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export * from "./qualified";
export * from "./schema";
export * from "drizzle-orm";
