import {
  type DashboardConversionByNicheResponse,
  dashboardConversionByNicheResponseSchema,
} from "@vetra/contracts";
import { dashboardServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function getConversionByNicheController(
  req: ValidatedRequest<typeof v.getConversionByNiche>,
  res: Response<DashboardConversionByNicheResponse>
) {
  const conversion = await dashboardServices.getConversionByNiche(req.query.period);
  res.json(dashboardConversionByNicheResponseSchema.parse(conversion));
}
