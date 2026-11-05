import { getLead } from "../../leads/services/getLead";
import { openWhatsappConversation } from "./openWhatsappConversation";

export async function openLeadConversation(leadId: string) {
  const { phone } = await getLead(leadId);

  return openWhatsappConversation(phone);
}
