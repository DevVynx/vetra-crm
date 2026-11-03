import { type Profile, profileDomain } from "../domain";
import { profileRepositories } from "../repositories";
import { getProfile } from "./getProfile";

type updateProfileInput = {
  name?: string;
  timeZone?: string;
};

export async function updateProfile(input: updateProfileInput): Promise<Profile> {
  const updated = profileDomain.applyChanges(await getProfile(), input);
  await profileRepositories.updateProfile(updated);

  return updated;
}
