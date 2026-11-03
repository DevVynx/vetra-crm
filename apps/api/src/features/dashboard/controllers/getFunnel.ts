import { type DashboardFunnelResponse, dashboardFunnelResponseSchema } from "@vetra/contracts";
import { dashboardServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function getFunnelController(
  req: ValidatedRequest<typeof v.getFunnel>,
  res: Response<DashboardFunnelResponse>
) {
  const funnel = await dashboardServices.getFunnel(req.query.period);
  res.json(dashboardFunnelResponseSchema.parse(funnel));
}
