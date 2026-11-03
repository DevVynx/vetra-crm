import { type Stage, stageDomain } from "../domain";
import { stageRepositories } from "../repositories";

type createStageInput = {
  name: string;
  color: string;
  role: "middle" | "archive";
};

export async function createStage(input: createStageInput): Promise<Stage> {
  const { created, layout } = stageDomain.add(await stageRepositories.findStages(), input);
  await stageRepositories.saveStages(layout);

  return created;
}
