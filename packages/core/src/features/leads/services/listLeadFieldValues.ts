import { stageRepositories } from "../../stages/repositories";
import { leadDomain } from "../domain";
import { leadRepositories } from "../repositories";

// Options for the niche and city filters, taken from the leads the list can show.
export async function listLeadFieldValues(field: "niche" | "city"): Promise<string[]> {
  const stages = await stageRepositories.findStages();
  return leadRepositories.findLeadFieldValues(field, leadDomain.visibleStageIdsFor(stages, []));
}
