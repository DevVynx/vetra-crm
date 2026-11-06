import { leadDomain } from "../../leads/domain";
import { leadRepositories } from "../../leads/repositories";
import type { Stage } from "../../stages/domain";
import { stageRepositories } from "../../stages/repositories";

const isLive = (stage: Stage) => stage.role === "entry" || stage.role === "middle";

type Move =
  // Forward in the funnel: never to an earlier stage, and never out of it.
  { kind: "forward"; onlyFromEntry?: boolean } | { kind: "archive" };

// Moves a lead on the user's behalf, quietly: if the target is gone, or the move would not be one the
// automation is allowed to make, nothing happens. Returns whether the lead moved.
export async function moveLeadByAutomation(
  leadId: string,
  targetStageId: string | null,
  move: Move
): Promise<boolean> {
  if (!targetStageId) return false;

  const [[lead], stages] = await Promise.all([
    leadRepositories.findLeadsByIds([leadId]),
    stageRepositories.findStages(),
  ]);
  const current = stages.find((stage) => stage.id === lead?.stageId);
  const target = stages.find((stage) => stage.id === targetStageId);
  if (!lead || !current || !target || !isLive(current)) return false;

  if (move.kind === "archive") {
    if (target.role !== "archive") return false;
  } else {
    if (target.role !== "middle" || target.position <= current.position) return false;
    if (move.onlyFromEntry && current.role !== "entry") return false;
  }

  const change = leadDomain.moveToStage(lead, current, target, new Date());
  await leadRepositories.saveLeadStages([change], target.role === "archive" ? [leadId] : []);

  return true;
}
