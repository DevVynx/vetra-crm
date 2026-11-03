import { type DashboardSummaryResponse, dashboardSummaryResponseSchema } from "@vetra/contracts";
import { dashboardServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function getSummaryController(
  req: ValidatedRequest<typeof v.getSummary>,
  res: Response<DashboardSummaryResponse>
) {
  const summary = await dashboardServices.getSummary(req.query.period);
  res.json(dashboardSummaryResponseSchema.parse(summary));
}
