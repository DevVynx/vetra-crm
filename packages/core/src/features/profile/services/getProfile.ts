import type { Profile } from "../domain";
import { ProfileNotFoundError } from "../errors";
import { profileRepositories } from "../repositories";

export async function getProfile(): Promise<Profile> {
  const profile = await profileRepositories.findProfile();
  if (!profile) throw new ProfileNotFoundError();

  return profile;
}
