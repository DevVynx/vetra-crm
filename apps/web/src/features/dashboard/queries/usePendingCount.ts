import { useAwaitingConversations } from "./useAwaitingConversations";
import { useGroupedNextActions } from "./useGroupedNextActions";

export function usePendingCount(): number | undefined {
  const { data: actions } = useGroupedNextActions();
  const { data: conversations } = useAwaitingConversations();

  if (!actions || !conversations) return undefined;
  return actions.overdue.length + actions.today.length + conversations.conversations.length;
}
