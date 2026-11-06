import { db, dealsTable } from "@vetra/database";

export async function findAllDeals() {
  return db.select().from(dealsTable).orderBy(dealsTable.createdAt);
}
