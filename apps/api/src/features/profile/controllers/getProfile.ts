import { type GetProfileResponse, getProfileResponseSchema } from "@vetra/contracts";
import { profileServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function getProfileController(
  _req: ValidatedRequest<typeof v.getProfile>,
  res: Response<GetProfileResponse>
) {
  const profile = await profileServices.getProfileWithPhoto();
  res.json(getProfileResponseSchema.parse(profile));
}
