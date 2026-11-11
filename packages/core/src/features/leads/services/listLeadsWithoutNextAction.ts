import { stageRepositories } from "../../stages/repositories";
import { type Lead, leadDomain } from "../domain";
import { leadRepositories } from "../repositories";

const WITHOUT_NEXT_ACTION_LIMIT = 5;

// Live leads with nothing scheduled, so the Painel can point out who is being forgotten. Only a few
// are listed: the full set is the Leads screen filtered by it.
export async function listLeadsWithoutNextAction(): Promise<{ items: Lead[]; total: number }> {
  const stages = await stageRepositories.findStages();
  return leadRepositories.findLeadsWithoutNextAction(
    leadDomain.visibleStageIdsFor(stages, []),
    WITHOUT_NEXT_ACTION_LIMIT
  );
}
