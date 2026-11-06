import { type LookupLeadsResponse, lookupLeadsResponseSchema } from "@vetra/contracts";
import { leadServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toPipelineLead } from "../helpers/leadResponses";
import type v from "../validators";

export async function lookupLeadsController(
  req: ValidatedRequest<typeof v.lookupLeads>,
  res: Response<LookupLeadsResponse>
) {
  const { slug, phone, name, city } = req.query;
  const hits = await leadServices.lookupLeads({
    slugs: slug,
    phones: phone,
    name: name ?? null,
    city: city ?? null,
  });

  res.json(
    lookupLeadsResponseSchema.parse({
      leads: hits.map((hit) => ({ ...toPipelineLead(hit), matchedBy: hit.matchedBy })),
    })
  );
}
