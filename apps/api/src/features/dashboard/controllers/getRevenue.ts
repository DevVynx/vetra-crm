import { type DashboardRevenueResponse, dashboardRevenueResponseSchema } from "@vetra/contracts";
import { dashboardServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function getRevenueController(
  req: ValidatedRequest<typeof v.getRevenue>,
  res: Response<DashboardRevenueResponse>
) {
  const { granularity, points } = await dashboardServices.getRevenue(req.query.period);
  res.json(
    dashboardRevenueResponseSchema.parse({
      granularity,
      points: points.map((point) => ({ ...point, bucketStart: point.bucketStart.toISOString() })),
    })
  );
}
