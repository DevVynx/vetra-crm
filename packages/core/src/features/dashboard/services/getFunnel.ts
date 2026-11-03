import { getProfile } from "../../profile/services/getProfile";
import { stageDomain } from "../../stages/domain";
import { stageRepositories } from "../../stages/repositories";
import { dashboardDomain, type DashboardPeriod } from "../domain";
import { dashboardRepositories } from "../repositories";

// Of the leads prospected in the period, how many reached each funnel stage.
export async function getFunnel(period: DashboardPeriod) {
  const [{ timeZone }, stages] = await Promise.all([getProfile(), stageRepositories.findStages()]);
  const { current } = await dashboardRepositories.findPeriodRanges(period, timeZone, new Date());
  const counts = await dashboardRepositories.countLeadsByFurthestStage(current);

  const funnelStageIds = stageDomain.funnelOf(stages).map((stage) => stage.id);
  return { funnel: dashboardDomain.funnelOf(funnelStageIds, counts) };
}
