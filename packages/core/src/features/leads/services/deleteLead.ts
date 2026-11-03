import { stageDomain } from "../../stages/domain";
import { stageRepositories } from "../../stages/repositories";
import { leadDomain } from "../domain";
import { leadRepositories } from "../repositories";
import { getLead } from "./getLead";

// Customers are deleted through the customers flow, which also removes their financial data.
export async function deleteLead(id: string): Promise<void> {
  const [lead, stages] = await Promise.all([getLead(id), stageRepositories.findStages()]);
  leadDomain.ensureIsNotCustomer(stageDomain.find(stages, lead.stageId));

  await leadRepositories.deleteLead(id);
}
