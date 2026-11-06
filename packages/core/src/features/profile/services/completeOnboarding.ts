import { profilePhotoStorage } from "@vetra/infra";

import { profileDomain, type ProfileWithPhoto } from "../domain";
import { profileRepositories } from "../repositories";
import { getProfile } from "./getProfile";

type completeOnboardingInput = {
  name: string;
  timeZone: string;
};

export async function completeOnboarding(
  input: completeOnboardingInput
): Promise<ProfileWithPhoto> {
  const done = profileDomain.completeOnboarding(await getProfile(), input, new Date());
  await profileRepositories.updateProfile(done);

  return profileDomain.withPhoto(done, await profilePhotoStorage.version());
}
