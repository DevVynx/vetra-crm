import { type Stage, stageDomain } from "../domain";
import { stageRepositories } from "../repositories";

type reorderStagesInput = {
  middleIds: string[];
  archiveIds: string[];
};

export async function reorderStages({
  middleIds,
  archiveIds,
}: reorderStagesInput): Promise<Stage[]> {
  const layout = stageDomain.reorder(await stageRepositories.findStages(), middleIds, archiveIds);
  await stageRepositories.saveStages(layout);

  return stageDomain.ordered(layout);
}
