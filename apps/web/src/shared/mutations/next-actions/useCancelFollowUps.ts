import { useMutation } from "@tanstack/react-query";
import type { CancelFollowUpsResponse, FollowUpsSnapshot } from "@vetra/contracts";
import { buildPath, nextActionsRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

import { useInvalidateNextActions } from "./useInvalidateNextActions";

const RESUME_TOAST_DURATION_IN_MS = 10_000;

// What the cancellation removed stays with the client, and the toast sends it back to resume.
export function useCancelFollowUps(leadId: string) {
  const invalidate = useInvalidateNextActions();

  const resume = useMutation({
    mutationFn: (snapshot: FollowUpsSnapshot) =>
      api.post(buildPath(nextActionsRoutes.resumeFollowUps, { id: leadId }), snapshot),
    onSuccess: invalidate,
    onError: (error) =>
      toast.error(getErrorMessage(error, "Não foi possível retomar os follow-ups.")),
  });

  return useMutation({
    mutationFn: async () =>
      (
        await api.post<CancelFollowUpsResponse>(
          buildPath(nextActionsRoutes.cancelFollowUps, { id: leadId })
        )
      ).data,
    onSuccess: (snapshot) => {
      invalidate();
      toast.success("Follow-ups cancelados.", {
        duration: RESUME_TOAST_DURATION_IN_MS,
        action: { label: "Retomar", onClick: () => resume.mutate(snapshot) },
      });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Não foi possível cancelar os follow-ups.")),
  });
}
