import { stageDomain } from "../../stages/domain";
import { stageRepositories } from "../../stages/repositories";
import { leadDomain, type LeadStageState } from "../domain";
import { LeadMustCloseWithDealError, LeadNotFoundError } from "../errors";
import { leadRepositories } from "../repositories";

// Undo of a stage change: writes back the previous stage, stopped-at stage and change date.
export async function restoreLeadStages(states: LeadStageState[]): Promise<void> {
  const ids = states.map((state) => state.id);
  const [leads, stages] = await Promise.all([
    leadRepositories.findLeadsByIds(ids),
    stageRepositories.findStages(),
  ]);
  if (leads.length !== new Set(ids).size) throw new LeadNotFoundError();

  for (const lead of leads) leadDomain.ensureIsNotCustomer(stageDomain.find(stages, lead.stageId));
  for (const state of states) {
    if (stageDomain.find(stages, state.stageId).role === "closing") {
      throw new LeadMustCloseWithDealError();
    }
    if (state.stoppedAtStageId) stageDomain.find(stages, state.stoppedAtStageId);
  }

  await leadRepositories.saveLeadStages(states, []);
}
