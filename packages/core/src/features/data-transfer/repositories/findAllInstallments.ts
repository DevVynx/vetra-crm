import { db, installmentsTable } from "@vetra/database";

export async function findAllInstallments() {
  return db.select().from(installmentsTable).orderBy(installmentsTable.createdAt);
}
