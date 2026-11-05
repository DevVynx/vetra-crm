import { profilePhotoStorage } from "@vetra/infra";

import { profileDomain, type ProfileWithPhoto } from "../domain";
import { InvalidProfilePhotoError } from "../errors";
import { getProfileWithPhoto } from "./getProfileWithPhoto";

export async function saveProfilePhoto(content: Buffer): Promise<ProfileWithPhoto> {
  if (!profileDomain.isProfilePhoto(content)) throw new InvalidProfilePhotoError();

  await profilePhotoStorage.save(content);
  return getProfileWithPhoto();
}
