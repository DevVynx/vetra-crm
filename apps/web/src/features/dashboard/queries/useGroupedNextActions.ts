import { useQuery } from "@tanstack/react-query";

import { groupNextActions } from "../utils/groupNextActions";
import { nextActionsQueryOptions } from "./useNextActions";

export function useGroupedNextActions() {
  return useQuery({
    ...nextActionsQueryOptions,
    select: (data) => groupNextActions(data.nextActions),
  });
}
