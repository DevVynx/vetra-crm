import { getProfile } from "../../profile/services/getProfile";
import { stageRepositories } from "../../stages/repositories";
import { type ImportPlan, planImport } from "../helpers/planImport";
import { readImportFiles } from "../helpers/readImportFiles";
import { dataTransferRepositories } from "../repositories";

export async function planImportOf(content: Buffer): Promise<ImportPlan> {
  const files = readImportFiles(content);
  const [profile, stages, phoneKeys] = await Promise.all([
    getProfile(),
    stageRepositories.findStages(),
    dataTransferRepositories.findLeadPhoneKeys(),
  ]);

  return planImport(files, {
    timeZone: profile.timeZone,
    stages,
    existingPhoneKeys: new Set(phoneKeys),
    now: new Date(),
  });
}
