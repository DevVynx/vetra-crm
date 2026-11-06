import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateInfo } from "@vetra/contracts";
import { updatesRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

const UPDATES_QUERY_KEY = ["updates"] as const;
const ONE_HOUR_IN_MS = 60 * 60 * 1000;

const readUpdateInfo = async (refresh: boolean) =>
  (await api.get<UpdateInfo>(updatesRoutes.base, { params: { refresh } })).data;

// The server keeps the check for hours, so the screen asks again only now and then.
export const updateInfoQueryOptions = queryOptions({
  queryKey: UPDATES_QUERY_KEY,
  queryFn: () => readUpdateInfo(false),
  staleTime: ONE_HOUR_IN_MS,
});

export function useUpdateInfo() {
  return useQuery(updateInfoQueryOptions);
}

// "Verificar agora": reads the list of releases again.
export function useCheckForUpdates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => readUpdateInfo(true),
    onSuccess: (info) => queryClient.setQueryData(UPDATES_QUERY_KEY, info),
  });
}
