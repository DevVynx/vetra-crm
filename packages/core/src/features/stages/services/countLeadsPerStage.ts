import { leadRepositories } from "../../leads/repositories";
import { stageRepositories } from "../repositories";

export async function countLeadsPerStage(): Promise<Record<string, number>> {
  const [stages, counts] = await Promise.all([
    stageRepositories.findStages(),
    leadRepositories.countLeadsByStage(),
  ]);
  return Object.fromEntries(stages.map((stage) => [stage.id, counts[stage.id] ?? 0]));
}
