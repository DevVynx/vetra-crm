import {
  type GetAutomationLeadsResponse,
  getAutomationLeadsResponseSchema,
  type SetAutomationLeadsResponse,
  setAutomationLeadsResponseSchema,
} from "@vetra/contracts";
import { automationServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function getAutomationLeadsController(
  _req: ValidatedRequest<typeof v.getAutomationLeads>,
  res: Response<GetAutomationLeadsResponse>
) {
  const counts = await automationServices.getAutoSendLeadsCounts();
  res.json(getAutomationLeadsResponseSchema.parse(counts));
}

export async function setAutomationLeadsController(
  req: ValidatedRequest<typeof v.setAutomationLeads>,
  res: Response<SetAutomationLeadsResponse>
) {
  const changed = await automationServices.setAutoSendForAllLeads(req.body.autoSend);
  res.json(setAutomationLeadsResponseSchema.parse({ changed }));
}
