import type { RestoreLedgerEntryResponse } from "@vetra/contracts";
import { ledgerServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { fromLedgerEntry } from "../helpers/ledgerResponses";
import type v from "../validators";

export async function restoreLedgerEntryController(
  req: ValidatedRequest<typeof v.restoreLedgerEntry>,
  res: Response<RestoreLedgerEntryResponse>
) {
  await ledgerServices.restoreLedgerEntry(fromLedgerEntry(req.params.id, req.body));
  res.status(204).end();
}
