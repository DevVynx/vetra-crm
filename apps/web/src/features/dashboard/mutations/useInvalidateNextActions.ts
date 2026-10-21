import { useQueryUtils } from "@/shared/lib/tanstack/useQueryUtils";

import { dashboardQueryKeys } from "../queries/keys";

export function useInvalidateNextActions() {
  const nextActions = useQueryUtils(dashboardQueryKeys.nextActions);
  const leadsWithoutNextAction = useQueryUtils(dashboardQueryKeys.leadsWithoutNextAction);

  return () => {
    nextActions.invalidate();
    leadsWithoutNextAction.invalidate();
  };
}
