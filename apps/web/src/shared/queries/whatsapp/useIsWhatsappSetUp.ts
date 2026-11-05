import { useWhatsappConversationCount } from "./useWhatsappConversationCount";
import { useWhatsappStatus } from "./useWhatsappStatus";

// False only before the first connection: while disconnected, the stored conversations still count.
// Undefined while it isn't known yet, so a screen can wait instead of flashing "not connected".
export function useIsWhatsappSetUp(): boolean | undefined {
  const status = useWhatsappStatus();
  const count = useWhatsappConversationCount();

  if (status.data?.status === "connected") return true;
  if (status.isPending || count.isPending) return undefined;

  return (count.data?.count ?? 0) > 0;
}
