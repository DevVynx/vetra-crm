import { type Stage, stageDomain } from "../domain";
import { stageRepositories } from "../repositories";

export async function listStages(): Promise<Stage[]> {
  return stageDomain.ordered(await stageRepositories.findStages());
}
