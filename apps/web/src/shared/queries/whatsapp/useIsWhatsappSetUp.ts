import { useWhatsappConversationCount } from "./useWhatsappConversationCount";
import { useWhatsappStatus } from "./useWhatsappStatus";

// False only before the first connection: while disconnected, the stored conversations still count.
export function useIsWhatsappSetUp(): boolean {
  const status = useWhatsappStatus();
  const count = useWhatsappConversationCount();

  return status.data?.status === "connected" || (count.data?.count ?? 0) > 0;
}
