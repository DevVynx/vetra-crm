import { z } from "zod";

import { leadStageSchema } from "../leads/common";

const amountInCentsSchema = z.number().int().nonnegative();
const countSchema = z.number().int().nonnegative();
// Relative change against the previous period of the same length (0.35 = +35%). Null when
// there is nothing to compare with: "all time", or a previous period that sums to zero.
const changeRatioSchema = z.number().nullable();

export const dashboardPeriodSchema = z.enum(["week", "month", "six_months", "year", "all_time"]);
export type DashboardPeriod = z.infer<typeof dashboardPeriodSchema>;

export const dashboardPeriodQuerySchema = z.object({
  period: dashboardPeriodSchema.default("month"),
});
export type DashboardPeriodQuery = z.infer<typeof dashboardPeriodQuerySchema>;

export const dashboardSummaryResponseSchema = z.object({
  received: z.object({
    amountInCents: amountInCentsSchema,
    paymentsCount: countSchema,
    changeRatio: changeRatioSchema,
  }),
  sold: z.object({
    amountInCents: amountInCentsSchema,
    clientsCount: countSchema,
    changeRatio: changeRatioSchema,
  }),
  receivable: z.object({
    amountInCents: amountInCentsSchema,
    pendingInstallmentsCount: countSchema,
  }),
  recurring: z.object({ monthlyAmountInCents: amountInCentsSchema, clientsCount: countSchema }),
  activeProjectsCount: countSchema,
  negotiating: z.object({ leadsCount: countSchema, proposalsCount: countSchema }),
});
export type DashboardSummaryResponse = z.infer<typeof dashboardSummaryResponseSchema>;

export const funnelStepSchema = z.object({
  stage: leadStageSchema,
  // Leads that reached this stage at some point, not the ones currently in it.
  reachedCount: countSchema,
});
export type FunnelStep = z.infer<typeof funnelStepSchema>;

export const dashboardFunnelResponseSchema = z.object({ funnel: z.array(funnelStepSchema) });
export type DashboardFunnelResponse = z.infer<typeof dashboardFunnelResponseSchema>;

export const revenueGranularitySchema = z.enum(["day", "month"]);
export type RevenueGranularity = z.infer<typeof revenueGranularitySchema>;

export const revenuePointSchema = z.object({
  bucketStart: z.iso.datetime(),
  // Running totals since the start of the period, so the last point matches the KPI cards.
  receivedInCents: amountInCentsSchema,
  soldInCents: amountInCentsSchema,
});
export type RevenuePoint = z.infer<typeof revenuePointSchema>;

export const dashboardRevenueResponseSchema = z.object({
  granularity: revenueGranularitySchema,
  points: z.array(revenuePointSchema),
});
export type DashboardRevenueResponse = z.infer<typeof dashboardRevenueResponseSchema>;
