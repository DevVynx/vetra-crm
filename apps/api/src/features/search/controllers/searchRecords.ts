import { type SearchResponse, searchResponseSchema } from "@vetra/contracts";
import { searchServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function searchRecordsController(
  req: ValidatedRequest<typeof v.searchRecords>,
  res: Response<SearchResponse>
) {
  const groups = await searchServices.searchRecords(req.query.q);
  res.json(searchResponseSchema.parse({ groups }));
}
