import { db, eq, profileTable } from "@vetra/database";

import type { Profile } from "../domain";

export async function updateProfile({ id, name, timeZone, onboardedAt }: Profile): Promise<void> {
  await db.update(profileTable).set({ name, timeZone, onboardedAt }).where(eq(profileTable.id, id));
}
