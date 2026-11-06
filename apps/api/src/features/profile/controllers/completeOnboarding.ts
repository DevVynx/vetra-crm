import {
  type CompleteOnboardingResponse,
  completeOnboardingResponseSchema,
} from "@vetra/contracts";
import { profileServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function completeOnboardingController(
  req: ValidatedRequest<typeof v.completeOnboarding>,
  res: Response<CompleteOnboardingResponse>
) {
  const profile = await profileServices.completeOnboarding(req.body);
  res.json(completeOnboardingResponseSchema.parse(profile));
}
