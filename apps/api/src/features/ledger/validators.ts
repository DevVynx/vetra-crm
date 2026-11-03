import {
  createLedgerEntryRequestSchema,
  customerParamsSchema,
  ledgerEntryParamsSchema,
  listLedgerEntriesQuerySchema,
  restoreLedgerEntryRequestSchema,
  updateLedgerEntryRequestSchema,
} from "@vetra/contracts";

import { validation } from "@/shared/http/validation";

const v = {
  listLedgerEntries: validation({
    params: customerParamsSchema,
    query: listLedgerEntriesQuerySchema,
  }),
  createLedgerEntry: validation({
    params: customerParamsSchema,
    body: createLedgerEntryRequestSchema,
  }),
  updateLedgerEntry: validation({
    params: ledgerEntryParamsSchema,
    body: updateLedgerEntryRequestSchema,
  }),
  deleteLedgerEntry: validation({ params: ledgerEntryParamsSchema }),
  restoreLedgerEntry: validation({
    params: customerParamsSchema,
    body: restoreLedgerEntryRequestSchema,
  }),
};

export default v;
