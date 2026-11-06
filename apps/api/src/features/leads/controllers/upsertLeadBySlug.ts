import { type UpsertLeadBySlugResponse, upsertLeadBySlugResponseSchema } from "@vetra/contracts";
import { leadServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toPipelineLead } from "../helpers/leadResponses";
import type v from "../validators";

export async function upsertLeadBySlugController(
  req: ValidatedRequest<typeof v.upsertLeadBySlug>,
  res: Response<UpsertLeadBySlugResponse>
) {
  const { prospectedAt, nextAction, ...fields } = req.body;

  const result = await leadServices.upsertLeadBySlug(req.params.slug, {
    ...fields,
    prospectedAt: prospectedAt ? new Date(prospectedAt) : null,
    nextAction: nextAction && {
      ...nextAction,
      dueAt: nextAction.dueAt ? new Date(nextAction.dueAt) : null,
    },
  });

  res.status(result.created ? 201 : 200).json(
    upsertLeadBySlugResponseSchema.parse({
      created: result.created,
      conflict: result.conflict,
      lead: toPipelineLead(result.lead),
    })
  );
}
