import type { Filter } from "../../../shared/filters";
import type { Sort } from "../../../shared/sort";
import { getProfile } from "../../profile/services/getProfile";
import { stageRepositories } from "../../stages/repositories";
import { leadDomain } from "../domain";
import { type LeadListRow, leadRepositories } from "../repositories";

type listLeadsInput = {
  search: string;
  filters: Filter[];
  sort: Sort | undefined;
  page: number;
  pageSize: number;
};

export async function listLeads({
  search,
  filters,
  sort,
  page,
  pageSize,
}: listLeadsInput): Promise<{
  items: LeadListRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const [stages, profile] = await Promise.all([stageRepositories.findStages(), getProfile()]);

  const result = await leadRepositories.findLeadsPage({
    visibleStageIds: leadDomain.visibleStageIdsFor(stages, filters),
    search,
    filters,
    sort,
    timeZone: profile.timeZone,
    page,
    pageSize,
  });
  return { ...result, pageSize };
}
