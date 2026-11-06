import { profilePhotoStorage } from "@vetra/infra";

import { profileDomain, type ProfileWithPhoto } from "../domain";
import { profileRepositories } from "../repositories";
import { getProfile } from "./getProfile";

type updateProfileInput = {
  name?: string;
  timeZone?: string;
};

export async function updateProfile(input: updateProfileInput): Promise<ProfileWithPhoto> {
  const updated = profileDomain.applyChanges(await getProfile(), input);
  await profileRepositories.updateProfile(updated);

  return profileDomain.withPhoto(updated, await profilePhotoStorage.version());
}
