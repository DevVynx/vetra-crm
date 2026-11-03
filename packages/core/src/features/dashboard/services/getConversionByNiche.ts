import { getProfile } from "../../profile/services/getProfile";
import { dashboardDomain, type DashboardPeriod } from "../domain";
import { dashboardRepositories } from "../repositories";

export async function getConversionByNiche(period: DashboardPeriod) {
  const { timeZone } = await getProfile();
  const { current } = await dashboardRepositories.findPeriodRanges(period, timeZone, new Date());

  return dashboardDomain.rankNiches(await dashboardRepositories.findNicheConversion(current));
}
