import { type ListLeadIdsResponse, listLeadIdsResponseSchema } from "@vetra/contracts";
import { leadServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function listLeadIdsController(
  req: ValidatedRequest<typeof v.listLeadIds>,
  res: Response<ListLeadIdsResponse>
) {
  const { q, filters } = req.query;
  const ids = await leadServices.listLeadIds({ search: q, filters });
  res.json(listLeadIdsResponseSchema.parse({ ids }));
}
