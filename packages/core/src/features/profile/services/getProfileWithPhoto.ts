import { profilePhotoStorage } from "@vetra/infra";

import type { ProfileWithPhoto } from "../domain";
import { getProfile } from "./getProfile";

// getProfile is read all over the place for the time zone; only the profile screens need the photo.
export async function getProfileWithPhoto(): Promise<ProfileWithPhoto> {
  const [profile, photoVersion] = await Promise.all([getProfile(), profilePhotoStorage.version()]);

  return { ...profile, photoVersion };
}
