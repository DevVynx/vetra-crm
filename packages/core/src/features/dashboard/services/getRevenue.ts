import { getProfile } from "../../profile/services/getProfile";
import { dashboardDomain, type DashboardPeriod } from "../domain";
import { dashboardRepositories } from "../repositories";

// Cumulative received and sold money since the start of the period ("all time": the first sale).
export async function getRevenue(period: DashboardPeriod) {
  const { timeZone } = await getProfile();
  const now = new Date();
  const [{ current }, history] = await Promise.all([
    dashboardRepositories.findPeriodRanges(period, timeZone, now),
    dashboardRepositories.findHistoryStart("sales", timeZone, now),
  ]);

  const granularity = dashboardDomain.revenueGranularityFor(period, history?.months ?? 0);
  const start = current?.start ?? history?.firstAt;
  if (!start) return { granularity, points: [] };

  const points = await dashboardRepositories.findRevenuePoints(start, now, granularity, timeZone);
  return { granularity, points };
}
