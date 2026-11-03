import { leadDomain } from "../../leads/domain";
import { getProfile } from "../../profile/services/getProfile";
import { stageDomain } from "../../stages/domain";
import { stageRepositories } from "../../stages/repositories";
import { dashboardDomain, type DashboardPeriod } from "../domain";
import { dashboardRepositories } from "../repositories";

export async function getSummary(period: DashboardPeriod) {
  const [profile, stages] = await Promise.all([getProfile(), stageRepositories.findStages()]);
  const { current, previous } = await dashboardRepositories.findPeriodRanges(
    period,
    profile.timeZone,
    new Date()
  );
  const lastMiddle = stageDomain.lastMiddleOf(stages);

  const [
    received,
    previousReceived,
    sold,
    previousSold,
    receivable,
    recurring,
    activeProjectsCount,
    leadsCount,
    lastStageLeadsCount,
  ] = await Promise.all([
    dashboardRepositories.sumPayments(current),
    previous ? dashboardRepositories.sumPayments(previous) : null,
    dashboardRepositories.sumSales(current),
    previous ? dashboardRepositories.sumSales(previous) : null,
    dashboardRepositories.sumReceivable(),
    dashboardRepositories.sumRecurring(),
    dashboardRepositories.countActiveProjects(),
    dashboardRepositories.countLeadsInStages(leadDomain.visibleStageIdsFor(stages, [])),
    dashboardRepositories.countLeadsInStages(lastMiddle ? [lastMiddle.id] : []),
  ]);

  return {
    received: {
      amountInCents: received.amountInCents,
      paymentsCount: received.count,
      changeRatio: dashboardDomain.changeRatio(
        received.amountInCents,
        previousReceived?.amountInCents ?? null
      ),
    },
    sold: {
      amountInCents: sold.amountInCents,
      customersCount: sold.count,
      changeRatio: dashboardDomain.changeRatio(
        sold.amountInCents,
        previousSold?.amountInCents ?? null
      ),
    },
    receivable: {
      amountInCents: receivable.amountInCents,
      pendingInstallmentsCount: receivable.count,
    },
    recurring: {
      monthlyAmountInCents: recurring.monthlyAmountInCents,
      customersCount: recurring.count,
    },
    activeProjectsCount,
    activeLeads: { leadsCount, lastStageLeadsCount },
  };
}
