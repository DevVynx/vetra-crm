import { type CreateLedgerEntryResponse, createLedgerEntryResponseSchema } from "@vetra/contracts";
import { ledgerServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { fromLedgerEntryInput, toLedgerEntry } from "../helpers/ledgerResponses";
import type v from "../validators";

export async function createLedgerEntryController(
  req: ValidatedRequest<typeof v.createLedgerEntry>,
  res: Response<CreateLedgerEntryResponse>
) {
  const { type, ...input } = req.body;
  const entry = await ledgerServices.createLedgerEntry(
    req.params.id,
    type,
    fromLedgerEntryInput(input)
  );
  res.status(201).json(createLedgerEntryResponseSchema.parse(toLedgerEntry(entry)));
}
