import { stageDomain } from "../domain";
import { stageRepositories } from "../repositories";

export async function ensureStages(): Promise<void> {
  const existing = await stageRepositories.findStages();
  if (existing.length > 0) return;

  await stageRepositories.saveStages(stageDomain.createPreset());
}
