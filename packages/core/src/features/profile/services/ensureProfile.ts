import { profileDomain } from "../domain";
import { profileRepositories } from "../repositories";

export async function ensureProfile(): Promise<void> {
  const existing = await profileRepositories.findProfile();
  if (existing) return;

  await profileRepositories.insertProfile(profileDomain.createDefault());
}
