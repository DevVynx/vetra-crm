import { db, eq, profileTable } from "@vetra/database";

import type { Profile } from "../domain";

export async function updateProfile({ id, name, timeZone }: Profile): Promise<void> {
  await db.update(profileTable).set({ name, timeZone }).where(eq(profileTable.id, id));
}
