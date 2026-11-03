import { type UpdateProfileResponse, updateProfileResponseSchema } from "@vetra/contracts";
import { profileServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function updateProfileController(
  req: ValidatedRequest<typeof v.updateProfile>,
  res: Response<UpdateProfileResponse>
) {
  const profile = await profileServices.updateProfile(req.body);
  res.json(updateProfileResponseSchema.parse(profile));
}
