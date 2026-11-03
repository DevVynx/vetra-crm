import { type ListLedgerEntriesResponse, listLedgerEntriesResponseSchema } from "@vetra/contracts";
import { ledgerServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toLedgerEntry } from "../helpers/ledgerResponses";
import type v from "../validators";

export async function listLedgerEntriesController(
  req: ValidatedRequest<typeof v.listLedgerEntries>,
  res: Response<ListLedgerEntriesResponse>
) {
  const entries = await ledgerServices.listLedgerEntries(req.params.id, req.query.filters);
  res.json(listLedgerEntriesResponseSchema.parse({ entries: entries.map(toLedgerEntry) }));
}
