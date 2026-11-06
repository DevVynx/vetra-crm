import { ConflictError } from "../../../shared/errors";

// The pipeline leaves "[SEU WHATSAPP]" for the user to fill in; sent as it is, it would go to the lead.
export class NextActionTextHasMarkerError extends ConflictError {
  constructor() {
    super("The text still has a marker to fill in, and the send was not confirmed");
  }
}
