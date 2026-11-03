import type { Lead } from "../domain";
import { changeLeadsStage } from "./changeLeadsStage";
import { getLead } from "./getLead";

export async function changeLeadStage(id: string, stageId: string): Promise<Lead> {
  await changeLeadsStage([id], stageId);
  return getLead(id);
}
