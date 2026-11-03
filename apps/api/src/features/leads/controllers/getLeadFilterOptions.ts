import { type FilterOptionsResponse, filterOptionsResponseSchema } from "@vetra/contracts";
import { leadServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function getLeadFilterOptionsController(
  req: ValidatedRequest<typeof v.getLeadFilterOptions>,
  res: Response<FilterOptionsResponse>
) {
  const values = await leadServices.listLeadFieldValues(req.query.field);
  const items = values.map((value) => ({ value, label: value }));
  res.json(filterOptionsResponseSchema.parse({ items }));
}
