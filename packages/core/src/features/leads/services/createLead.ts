import { stageDomain } from "../../stages/domain";
import { stageRepositories } from "../../stages/repositories";
import { type Lead, type LeadContact, leadDomain } from "../domain";
import { leadRepositories } from "../repositories";

export async function createLead(contact: LeadContact): Promise<Lead> {
  const stages = await stageRepositories.findStages();
  const lead = leadDomain.create(contact, stageDomain.entryOf(stages), new Date());
  await leadRepositories.insertLead(lead);

  return lead;
}
