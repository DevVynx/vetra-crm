import { type UpdateProfileResponse, updateProfileResponseSchema } from "@vetra/contracts";
import { profileServices } from "@vetra/core";
import type { Response } from "express";

import { BadRequestError } from "@/shared/http/errors";
import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function saveProfilePhotoController(
  req: ValidatedRequest<typeof v.savePhoto>,
  res: Response<UpdateProfileResponse>
) {
  const content: unknown = req.body;
  if (!Buffer.isBuffer(content) || content.length === 0) {
    throw new BadRequestError("The request has no file.");
  }

  const profile = await profileServices.saveProfilePhoto(content);
  res.json(updateProfileResponseSchema.parse(profile));
}
