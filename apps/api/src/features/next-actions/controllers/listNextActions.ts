import { type ListNextActionsResponse, listNextActionsResponseSchema } from "@vetra/contracts";
import { nextActionServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toNextAction } from "../helpers/nextActionResponses";
import type v from "../validators";

export async function listNextActionsController(
  _req: ValidatedRequest<typeof v.listNextActions>,
  res: Response<ListNextActionsResponse>
) {
  const actions = await nextActionServices.listNextActions();
  res.json(listNextActionsResponseSchema.parse({ nextActions: actions.map(toNextAction) }));
}
