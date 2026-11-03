import { ledgerRoutes } from "@vetra/routes";
import { Router } from "express";

import {
  createLedgerEntryController,
  deleteLedgerEntryController,
  listLedgerEntriesController,
  restoreLedgerEntryController,
  updateLedgerEntryController,
} from "./controllers";
import v from "./validators";

export const ledgerRouter: Router = Router();

ledgerRouter.get(ledgerRoutes.byCustomer, v.listLedgerEntries, listLedgerEntriesController);
ledgerRouter.post(ledgerRoutes.byCustomer, v.createLedgerEntry, createLedgerEntryController);
// /ledger/restore goes before /ledger/:entryId, otherwise "restore" would be read as an id.
ledgerRouter.post(ledgerRoutes.restore, v.restoreLedgerEntry, restoreLedgerEntryController);
ledgerRouter.patch(ledgerRoutes.byId, v.updateLedgerEntry, updateLedgerEntryController);
ledgerRouter.delete(ledgerRoutes.byId, v.deleteLedgerEntry, deleteLedgerEntryController);
