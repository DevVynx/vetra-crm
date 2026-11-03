import { type FilterOptionsResponse, filterOptionsResponseSchema } from "@vetra/contracts";
import { customerServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function getCustomerFilterOptionsController(
  req: ValidatedRequest<typeof v.getCustomerFilterOptions>,
  res: Response<FilterOptionsResponse>
) {
  const values = await customerServices.listCustomerFieldValues(req.query.field);
  const items = values.map((value) => ({ value, label: value }));
  res.json(filterOptionsResponseSchema.parse({ items }));
}
