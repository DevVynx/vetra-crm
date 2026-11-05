import { type UpdateProfileResponse, updateProfileResponseSchema } from "@vetra/contracts";
import { profileServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function removeProfilePhotoController(
  _req: ValidatedRequest<typeof v.removePhoto>,
  res: Response<UpdateProfileResponse>
) {
  const profile = await profileServices.removeProfilePhoto();
  res.json(updateProfileResponseSchema.parse(profile));
}
