import { type Stage, stageDomain } from "../domain";
import { stageRepositories } from "../repositories";

type updateStageInput = {
  id: string;
  name: string;
  color: string;
};

export async function updateStage({ id, name, color }: updateStageInput): Promise<Stage> {
  const stage = stageDomain.find(await stageRepositories.findStages(), id);
  const updated = { ...stage, name, color };
  await stageRepositories.saveStages([updated]);

  return updated;
}
