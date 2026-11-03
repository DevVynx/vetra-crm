import { type UpdateLedgerEntryResponse, updateLedgerEntryResponseSchema } from "@vetra/contracts";
import { ledgerServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { fromLedgerEntryInput, toLedgerEntry } from "../helpers/ledgerResponses";
import type v from "../validators";

export async function updateLedgerEntryController(
  req: ValidatedRequest<typeof v.updateLedgerEntry>,
  res: Response<UpdateLedgerEntryResponse>
) {
  const entry = await ledgerServices.updateLedgerEntry(
    req.params.id,
    req.params.entryId,
    fromLedgerEntryInput(req.body)
  );
  res.json(updateLedgerEntryResponseSchema.parse(toLedgerEntry(entry)));
}
