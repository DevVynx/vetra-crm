import { db, profileTable } from "@vetra/database";

import type { Profile } from "../domain";

export async function insertProfile(profile: Profile): Promise<void> {
  await db.insert(profileTable).values(profile);
}
