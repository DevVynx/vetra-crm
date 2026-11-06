import {
  type GetAutomationSettingsResponse,
  getAutomationSettingsResponseSchema,
  type UpdateAutomationSettingsResponse,
  updateAutomationSettingsResponseSchema,
} from "@vetra/contracts";
import { automationServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function getAutomationSettingsController(
  _req: ValidatedRequest<typeof v.getAutomationSettings>,
  res: Response<GetAutomationSettingsResponse>
) {
  const settings = await automationServices.getAutomationSettings();
  res.json(getAutomationSettingsResponseSchema.parse(settings));
}

export async function updateAutomationSettingsController(
  req: ValidatedRequest<typeof v.updateAutomationSettings>,
  res: Response<UpdateAutomationSettingsResponse>
) {
  const settings = await automationServices.updateAutomationSettings(req.body);
  res.json(updateAutomationSettingsResponseSchema.parse(settings));
}
