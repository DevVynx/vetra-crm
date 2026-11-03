import { stageRepositories } from "../../stages/repositories";
import { type Lead, leadDomain } from "../domain";
import { leadRepositories } from "../repositories";

// Live leads with nothing scheduled, so the Painel can point out who is being forgotten.
export async function listLeadsWithoutNextAction(): Promise<Lead[]> {
  const stages = await stageRepositories.findStages();
  return leadRepositories.findLeadsWithoutNextAction(leadDomain.visibleStageIdsFor(stages, []));
}
