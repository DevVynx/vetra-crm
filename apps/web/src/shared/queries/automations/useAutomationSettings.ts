import { queryOptions, useQuery } from "@tanstack/react-query";
import type { GetAutomationSettingsResponse } from "@vetra/contracts";
import { automationsRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

export const automationsQueryKeys = {
  all: ["automations"] as const,
};

export const automationSettingsQueryOptions = queryOptions({
  queryKey: automationsQueryKeys.all,
  queryFn: async () => (await api.get<GetAutomationSettingsResponse>(automationsRoutes.base)).data,
});

export function useAutomationSettings() {
  return useQuery(automationSettingsQueryOptions);
}

// Everything about the automatic sending (a lead's switch, its mark, the status of an activity) is only
// on screen while the master switch is on.
export function useIsAutoSendEnabled(): boolean {
  return useAutomationSettings().data?.autoSendEnabled ?? false;
}
