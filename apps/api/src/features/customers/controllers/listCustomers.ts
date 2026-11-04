import { type ListCustomersResponse, listCustomersResponseSchema } from "@vetra/contracts";
import { customerServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toCustomerListItem } from "../helpers/customerResponses";
import type v from "../validators";

export async function listCustomersController(
  req: ValidatedRequest<typeof v.listCustomers>,
  res: Response<ListCustomersResponse>
) {
  const { q, filters, sort, direction, page, pageSize } = req.query;
  const result = await customerServices.listCustomers({
    search: q,
    filters,
    sort: sort && direction ? { field: sort, direction } : undefined,
    page,
    pageSize,
  });
  res.json(
    listCustomersResponseSchema.parse({ ...result, items: result.items.map(toCustomerListItem) })
  );
}
