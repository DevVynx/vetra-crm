import { stageDomain } from "../../stages/domain";
import { stageRepositories } from "../../stages/repositories";
import { type Lead, leadDomain, type LeadFields } from "../domain";
import { leadRepositories } from "../repositories";
import { ensurePhoneIsAvailable, withUniquePhone } from "./ensurePhoneIsAvailable";

export async function createLead(fields: LeadFields): Promise<Lead> {
  await ensurePhoneIsAvailable(fields.phone);

  const stages = await stageRepositories.findStages();
  const lead = leadDomain.create(fields, stageDomain.entryOf(stages), new Date());
  await withUniquePhone(() => leadRepositories.insertLead(lead));

  return lead;
}
