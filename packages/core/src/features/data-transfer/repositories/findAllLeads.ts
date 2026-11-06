import { db, leadsTable } from "@vetra/database";

export async function findAllLeads() {
  return db.select().from(leadsTable).orderBy(leadsTable.createdAt);
}
