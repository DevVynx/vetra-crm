import { deleteLedgerEntry } from "./deleteLedgerEntry";
import { findLedgerEntries } from "./findLedgerEntries";
import { ledgerEntryIdExists } from "./ledgerEntryIdExists";
import { saveLedgerEntry } from "./saveLedgerEntry";

export const ledgerRepositories = {
  deleteLedgerEntry,
  findLedgerEntries,
  ledgerEntryIdExists,
  saveLedgerEntry,
};
