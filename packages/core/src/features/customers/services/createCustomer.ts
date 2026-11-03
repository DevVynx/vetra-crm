import { type Lead, type LeadContact, leadDomain } from "../../leads/domain";
import { stageDomain } from "../../stages/domain";
import { stageRepositories } from "../../stages/repositories";
import { customerDomain, type DealPayment } from "../domain";
import { customerRepositories } from "../repositories";

type createCustomerInput = {
  contact: LeadContact;
  document: string | null;
  payment: DealPayment;
};

// A customer registered directly: a lead already in the closing stage, with its deal.
export async function createCustomer({
  contact,
  document,
  payment,
}: createCustomerInput): Promise<Lead> {
  const stages = await stageRepositories.findStages();
  const closingStage = stageDomain.closingOf(stages);

  const now = new Date();
  const lead = leadDomain.createClosed(contact, closingStage, now);
  const { deal, installments } = customerDomain.open(lead.id, document, payment, now);
  await customerRepositories.insertCustomer(lead, deal, installments);

  return lead;
}
