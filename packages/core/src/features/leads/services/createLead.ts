import { stageRepositories } from "../../stages/repositories";
import { type Lead, type LeadContact, leadDomain } from "../domain";
import { leadRepositories } from "../repositories";

export async function createLead(contact: LeadContact): Promise<Lead> {
  const stages = await stageRepositories.findStages();
  const entry = stages.find((stage) => stage.role === "entry");
  if (!entry) throw new Error("No entry stage: the stage preset was not created");

  const lead = leadDomain.create(contact, entry, new Date());
  await leadRepositories.insertLead(lead);

  return lead;
}
