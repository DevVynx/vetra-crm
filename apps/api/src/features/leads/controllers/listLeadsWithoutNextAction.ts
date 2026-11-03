import {
  type ListLeadsWithoutNextActionResponse,
  listLeadsWithoutNextActionResponseSchema,
} from "@vetra/contracts";
import { leadServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toLeadSummary } from "../helpers/leadResponses";
import type v from "../validators";

export async function listLeadsWithoutNextActionController(
  _req: ValidatedRequest<typeof v.listLeadsWithoutNextAction>,
  res: Response<ListLeadsWithoutNextActionResponse>
) {
  const leads = await leadServices.listLeadsWithoutNextAction();
  res.json(listLeadsWithoutNextActionResponseSchema.parse({ leads: leads.map(toLeadSummary) }));
}
