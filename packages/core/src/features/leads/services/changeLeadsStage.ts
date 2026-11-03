import { stageDomain } from "../../stages/domain";
import { stageRepositories } from "../../stages/repositories";
import { leadDomain, type LeadStageState } from "../domain";
import { LeadNotFoundError } from "../errors";
import { leadRepositories } from "../repositories";

// Moves every lead or none, and returns their previous state so the change can be undone.
export async function changeLeadsStage(ids: string[], stageId: string): Promise<LeadStageState[]> {
  const [leads, stages] = await Promise.all([
    leadRepositories.findLeadsByIds(ids),
    stageRepositories.findStages(),
  ]);
  if (leads.length !== new Set(ids).size) throw new LeadNotFoundError();

  const target = stageDomain.find(stages, stageId);
  const now = new Date();
  const changes = leads.map((lead) =>
    leadDomain.moveToStage(lead, stageDomain.find(stages, lead.stageId), target, now)
  );

  await leadRepositories.saveLeadStages(changes, target.role === "archive" ? ids : []);
  return leads.map(leadDomain.stageStateOf);
}
