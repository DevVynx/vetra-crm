import { type CancelFollowUpsResponse, cancelFollowUpsResponseSchema } from "@vetra/contracts";
import { nextActionServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function cancelFollowUpsController(
  req: ValidatedRequest<typeof v.cancelFollowUps>,
  res: Response<CancelFollowUpsResponse>
) {
  const { actions, queue } = await nextActionServices.cancelLeadFollowUps(req.params.id);

  res.json(
    cancelFollowUpsResponseSchema.parse({
      actions: actions.map((action) => ({ ...action, dueAt: action.dueAt.toISOString() })),
      queue,
    })
  );
}
