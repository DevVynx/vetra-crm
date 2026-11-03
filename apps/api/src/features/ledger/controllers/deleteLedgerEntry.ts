import type { DeleteLedgerEntryResponse } from "@vetra/contracts";
import { ledgerServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function deleteLedgerEntryController(
  req: ValidatedRequest<typeof v.deleteLedgerEntry>,
  res: Response<DeleteLedgerEntryResponse>
) {
  await ledgerServices.deleteLedgerEntry(req.params.id, req.params.entryId);
  res.status(204).end();
}
