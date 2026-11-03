import { type CreateNextActionResponse, createNextActionResponseSchema } from "@vetra/contracts";
import { nextActionServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { fromNextActionInput, toNextAction } from "../helpers/nextActionResponses";
import type v from "../validators";

export async function createNextActionController(
  req: ValidatedRequest<typeof v.createNextAction>,
  res: Response<CreateNextActionResponse>
) {
  const { leadId, ...input } = req.body;
  const action = await nextActionServices.createNextAction(leadId, fromNextActionInput(input));
  res.status(201).json(createNextActionResponseSchema.parse(toNextAction(action)));
}
