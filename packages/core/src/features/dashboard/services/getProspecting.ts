import { getProfile } from "../../profile/services/getProfile";
import { dashboardDomain, type DashboardPeriod } from "../domain";
import { dashboardRepositories } from "../repositories";

// Leads prospected per bucket since the start of the period ("all time": the first prospect).
export async function getProspecting(period: DashboardPeriod) {
  const { timeZone } = await getProfile();
  const now = new Date();
  const [{ current }, history] = await Promise.all([
    dashboardRepositories.findPeriodRanges(period, timeZone, now),
    dashboardRepositories.findHistoryStart("prospecting", timeZone, now),
  ]);

  const granularity = dashboardDomain.prospectingGranularityFor(period, history?.months ?? 0);
  const start = current?.start ?? history?.firstAt;
  if (!start) return { granularity, points: [] };

  const points = await dashboardRepositories.findProspectingPoints(
    start,
    now,
    granularity,
    timeZone
  );
  return { granularity, points };
}
