import { stageDomain } from "../domain";
import { stageRepositories } from "../repositories";

export async function deleteStage(id: string): Promise<void> {
  const stages = await stageRepositories.findStages();
  const target = stageDomain.deletionTargetOf(stages, id);

  await stageRepositories.deleteStage(id, target.id, stageDomain.remove(stages, id));
}
