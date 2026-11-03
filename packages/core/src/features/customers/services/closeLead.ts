import { type Lead, leadDomain } from "../../leads/domain";
import { getLead } from "../../leads/services/getLead";
import { stageDomain } from "../../stages/domain";
import { stageRepositories } from "../../stages/repositories";
import { customerDomain, type DealPayment } from "../domain";
import { customerRepositories } from "../repositories";

export async function closeLead(leadId: string, payment: DealPayment): Promise<Lead> {
  const [lead, stages] = await Promise.all([getLead(leadId), stageRepositories.findStages()]);
  const closingStage = stageDomain.closingOf(stages);

  const now = new Date();
  const stageState = leadDomain.close(
    lead,
    stageDomain.find(stages, lead.stageId),
    closingStage,
    now
  );
  const { deal, installments } = customerDomain.open(leadId, null, payment, now);
  await customerRepositories.saveClosing(stageState, deal, installments);

  return getLead(leadId);
}
