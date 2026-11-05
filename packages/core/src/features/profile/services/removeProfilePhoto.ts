import { profilePhotoStorage } from "@vetra/infra";

import type { ProfileWithPhoto } from "../domain";
import { getProfileWithPhoto } from "./getProfileWithPhoto";

export async function removeProfilePhoto(): Promise<ProfileWithPhoto> {
  await profilePhotoStorage.remove();
  return getProfileWithPhoto();
}
