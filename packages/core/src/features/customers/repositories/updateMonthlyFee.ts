import { db, dealsTable, eq } from "@vetra/database";

export async function updateMonthlyFee(
  leadId: string,
  monthlyFeeInCents: number | null
): Promise<void> {
  await db.update(dealsTable).set({ monthlyFeeInCents }).where(eq(dealsTable.leadId, leadId));
}
