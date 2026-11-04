import type { Filter } from "../../../shared/filters";
import { getProfile } from "../../profile/services/getProfile";
import { stageRepositories } from "../../stages/repositories";
import { leadDomain } from "../domain";
import { leadRepositories } from "../repositories";

type listLeadIdsInput = {
  search: string;
  filters: Filter[];
};

// Every lead the list would show, across its pages.
export async function listLeadIds({ search, filters }: listLeadIdsInput): Promise<string[]> {
  const [stages, profile] = await Promise.all([stageRepositories.findStages(), getProfile()]);

  return leadRepositories.findLeadIds({
    visibleStageIds: leadDomain.visibleStageIdsFor(stages, filters),
    search,
    filters,
    timeZone: profile.timeZone,
  });
}
