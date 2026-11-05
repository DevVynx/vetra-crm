import { profilePhotoStorage } from "@vetra/infra";

import { ProfilePhotoNotFoundError } from "../errors";

export async function readProfilePhoto(): Promise<{ content: Buffer; version: number }> {
  const photo = await profilePhotoStorage.read();
  if (!photo) throw new ProfilePhotoNotFoundError();

  return photo;
}
