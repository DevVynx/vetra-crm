import { type ListLeadsResponse, listLeadsResponseSchema } from "@vetra/contracts";
import { leadServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toLeadListItem } from "../helpers/leadResponses";
import type v from "../validators";

export async function listLeadsController(
  req: ValidatedRequest<typeof v.listLeads>,
  res: Response<ListLeadsResponse>
) {
  const { q, filters, page, pageSize } = req.query;
  const result = await leadServices.listLeads({ search: q, filters, page, pageSize });
  res.json(listLeadsResponseSchema.parse({ ...result, items: result.items.map(toLeadListItem) }));
}
