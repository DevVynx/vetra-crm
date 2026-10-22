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
    customersCount: countSchema,
    changeRatio: changeRatioSchema,
  }),
  receivable: z.object({
    amountInCents: amountInCentsSchema,
    pendingInstallmentsCount: countSchema,
  }),
  recurring: z.object({ monthlyAmountInCents: amountInCentsSchema, customersCount: countSchema }),
  activeProjectsCount: countSchema,
  negotiating: z.object({ leadsCount: countSchema, proposalsCount: countSchema }),
});
export type DashboardSummaryResponse = z.infer<typeof dashboardSummaryResponseSchema>;

export const funnelStepSchema = z.object({
  stage: leadStageSchema,
  // Cohort count: leads prospected in the period that reached this stage at some point,
  // not the ones currently in it.
  reachedCount: countSchema,
});
export type FunnelStep = z.infer<typeof funnelStepSchema>;

export const dashboardFunnelResponseSchema = z.object({ funnel: z.array(funnelStepSchema) });
export type DashboardFunnelResponse = z.infer<typeof dashboardFunnelResponseSchema>;

export const revenueGranularitySchema = z.enum(["day", "month", "year"]);
export type RevenueGranularity = z.infer<typeof revenueGranularitySchema>;

export const revenuePointSchema = z.object({
  bucketStart: z.iso.datetime(),
  receivedInCents: amountInCentsSchema,
  soldInCents: amountInCentsSchema,
});
export type RevenuePoint = z.infer<typeof revenuePointSchema>;

export const dashboardRevenueResponseSchema = z.object({
  granularity: revenueGranularitySchema,
  points: z.array(revenuePointSchema),
});
export type DashboardRevenueResponse = z.infer<typeof dashboardRevenueResponseSchema>;

export const prospectingGranularitySchema = z.enum(["day", "week", "month", "year"]);
export type ProspectingGranularity = z.infer<typeof prospectingGranularitySchema>;

export const prospectingPointSchema = z.object({
  bucketStart: z.iso.datetime(),
  prospectedCount: countSchema,
  // Of the leads prospected in this bucket, the ones that ended up closed (same cohort logic
  // as the funnel), so it never exceeds prospectedCount.
  wonCount: countSchema,
});
export type ProspectingPoint = z.infer<typeof prospectingPointSchema>;

export const dashboardProspectingResponseSchema = z.object({
  granularity: prospectingGranularitySchema,
  points: z.array(prospectingPointSchema),
});
export type DashboardProspectingResponse = z.infer<typeof dashboardProspectingResponseSchema>;

export const nicheConversionSchema = z.object({
  niche: z.string(),
  prospectedCount: countSchema,
  wonCount: countSchema,
});
export type NicheConversion = z.infer<typeof nicheConversionSchema>;

export const dashboardConversionByNicheResponseSchema = z.object({
  niches: z.array(nicheConversionSchema),
  others: nicheConversionSchema.omit({ niche: true }).nullable(),
});
export type DashboardConversionByNicheResponse = z.infer<
  typeof dashboardConversionByNicheResponseSchema
>;
