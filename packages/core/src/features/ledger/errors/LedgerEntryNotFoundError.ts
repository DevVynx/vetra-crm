import { NotFoundError } from "../../../shared/errors";

export class LedgerEntryNotFoundError extends NotFoundError {
  constructor() {
    super("Ledger entry not found");
  }
}
