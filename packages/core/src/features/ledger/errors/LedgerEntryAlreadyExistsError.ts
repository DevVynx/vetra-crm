import { ConflictError } from "../../../shared/errors";

export class LedgerEntryAlreadyExistsError extends ConflictError {
  constructor() {
    super("The ledger entry already exists");
  }
}
