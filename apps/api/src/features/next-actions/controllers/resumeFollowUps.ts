import type { ResumeFollowUpsResponse } from "@vetra/contracts";
import { nextActionServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { fromNextActionInput } from "../helpers/nextActionResponses";
import type v from "../validators";

export async function resumeFollowUpsController(
  req: ValidatedRequest<typeof v.resumeFollowUps>,
  res: Response<ResumeFollowUpsResponse>
) {
  const { actions, queue } = req.body;

  await nextActionServices.resumeLeadFollowUps(req.params.id, {
    actions: actions.map(({ id, leadId, ...input }) => ({
      id,
      leadId,
      ...fromNextActionInput(input),
    })),
    queue,
  });
  res.status(204).end();
}
