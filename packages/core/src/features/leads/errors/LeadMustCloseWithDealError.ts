import { InvariantViolationError } from "../../../shared/errors";

export class LeadMustCloseWithDealError extends InvariantViolationError {
  constructor() {
    super("A lead reaches the closing stage only by closing a deal");
  }
}
