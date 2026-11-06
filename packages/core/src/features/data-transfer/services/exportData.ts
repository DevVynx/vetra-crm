import { createZip } from "@vetra/infra";

import { getProfile } from "../../profile/services/getProfile";
import { dataTransferDomain } from "../domain";
import { dataTransferRepositories } from "../repositories";

// Everything the CRM owns, one CSV per kind in a zip. WhatsApp is not part of it.
export async function exportData(): Promise<{ filename: string; content: Buffer }> {
  const [profile, leads, deals, stages, projects, installments, expenses, notes, nextActions] =
    await Promise.all([
      getProfile(),
      dataTransferRepositories.findAllLeads(),
      dataTransferRepositories.findAllDeals(),
      dataTransferRepositories.findAllStages(),
      dataTransferRepositories.findAllProjects(),
      dataTransferRepositories.findAllInstallments(),
      dataTransferRepositories.findAllExpenses(),
      dataTransferRepositories.findAllNotes(),
      dataTransferRepositories.findAllNextActions(),
    ]);

  const now = new Date();
  const files = dataTransferDomain.exportFiles(
    { leads, deals, stages, projects, installments, expenses, notes, nextActions },
    profile.timeZone
  );

  return {
    filename: dataTransferDomain.exportFilename(now, profile.timeZone),
    content: createZip(
      files.map((file) => ({ name: file.name, content: Buffer.from(file.csv, "utf8") })),
      now
    ),
  };
}
