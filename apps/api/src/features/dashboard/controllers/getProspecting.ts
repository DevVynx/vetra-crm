import {
  type DashboardProspectingResponse,
  dashboardProspectingResponseSchema,
} from "@vetra/contracts";
import { dashboardServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function getProspectingController(
  req: ValidatedRequest<typeof v.getProspecting>,
  res: Response<DashboardProspectingResponse>
) {
  const { granularity, points } = await dashboardServices.getProspecting(req.query.period);
  res.json(
    dashboardProspectingResponseSchema.parse({
      granularity,
      points: points.map((point) => ({ ...point, bucketStart: point.bucketStart.toISOString() })),
    })
  );
}
