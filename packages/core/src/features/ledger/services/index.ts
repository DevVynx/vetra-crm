import { createLedgerEntry } from "./createLedgerEntry";
import { deleteLedgerEntry } from "./deleteLedgerEntry";
import { listLedgerEntries } from "./listLedgerEntries";
import { restoreLedgerEntry } from "./restoreLedgerEntry";
import { updateLedgerEntry } from "./updateLedgerEntry";

export const ledgerServices = {
  createLedgerEntry,
  deleteLedgerEntry,
  listLedgerEntries,
  restoreLedgerEntry,
  updateLedgerEntry,
};
