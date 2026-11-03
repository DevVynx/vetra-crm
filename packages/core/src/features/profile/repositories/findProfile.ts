import { db, profileTable } from "@vetra/database";

import type { Profile } from "../domain";

export async function findProfile(): Promise<Profile | undefined> {
  const [row] = await db
    .select({ id: profileTable.id, name: profileTable.name, timeZone: profileTable.timeZone })
    .from(profileTable)
    .limit(1);
  return row;
}
