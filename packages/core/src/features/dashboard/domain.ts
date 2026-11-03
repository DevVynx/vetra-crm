export type DashboardPeriod = "week" | "month" | "six_months" | "year" | "all_time";
export type RevenueGranularity = "day" | "month" | "year";
export type ProspectingGranularity = "day" | "week" | "month" | "year";

export type DateRange = { start: Date; end: Date };

// "Todo o período" shows one bar per year only once the history is longer than this.
const MAX_MONTHLY_SPAN_IN_MONTHS = 24;
const TOP_NICHES = 11;

// Relative change against the previous period; null when there is nothing to compare with.
function changeRatio(current: number, previous: number | null): number | null {
  if (previous === null || previous === 0) return null;
  return (current - previous) / previous;
}

const hasLongHistory = (period: DashboardPeriod, historyInMonths: number) =>
  period === "all_time" && historyInMonths > MAX_MONTHLY_SPAN_IN_MONTHS;

function revenueGranularityFor(
  period: DashboardPeriod,
  historyInMonths: number
): RevenueGranularity {
  if (period === "week" || period === "month") return "day";
  return hasLongHistory(period, historyInMonths) ? "year" : "month";
}

function prospectingGranularityFor(
  period: DashboardPeriod,
  historyInMonths: number
): ProspectingGranularity {
  if (period === "week") return "day";
  if (period === "month") return "week";
  return hasLongHistory(period, historyInMonths) ? "year" : "month";
}

// There is no stage history: a lead counts as having reached every funnel stage up to its
// current one (or, when archived, the one it stopped at).
function funnelOf(
  funnelStageIds: string[],
  leadsByFurthestStage: Map<string, number>
): { stage: string; reachedCount: number }[] {
  return funnelStageIds.map((stage, index) => ({
    stage,
    reachedCount: funnelStageIds
      .slice(index)
      .reduce((total, laterStage) => total + (leadsByFurthestStage.get(laterStage) ?? 0), 0),
  }));
}

export type NicheConversion = { niche: string; prospectedCount: number; wonCount: number };

// Best converting niches first (ties: the most prospected, then by name); the tail is grouped
// as "others".
function rankNiches(niches: NicheConversion[]): {
  niches: NicheConversion[];
  others: { prospectedCount: number; wonCount: number } | null;
} {
  const conversionOf = (item: NicheConversion) => item.wonCount / item.prospectedCount;
  const ranked = [...niches].sort(
    (a, b) =>
      conversionOf(b) - conversionOf(a) ||
      b.prospectedCount - a.prospectedCount ||
      a.niche.localeCompare(b.niche, "pt-BR")
  );
  const rest = ranked.slice(TOP_NICHES);

  return {
    niches: ranked.slice(0, TOP_NICHES),
    others:
      rest.length === 0
        ? null
        : {
            prospectedCount: rest.reduce((total, item) => total + item.prospectedCount, 0),
            wonCount: rest.reduce((total, item) => total + item.wonCount, 0),
          },
  };
}

export const dashboardDomain = {
  changeRatio,
  revenueGranularityFor,
  prospectingGranularityFor,
  funnelOf,
  rankNiches,
};
