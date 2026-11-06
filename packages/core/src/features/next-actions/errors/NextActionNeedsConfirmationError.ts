import { ConflictError } from "../../../shared/errors";

// The lead asked not to be contacted: sending is only done after the user confirms it.
export class NextActionNeedsConfirmationError extends ConflictError {
  constructor() {
    super("The lead asked not to be contacted, and the send was not confirmed");
  }
}
