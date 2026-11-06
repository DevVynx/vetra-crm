import { InvariantViolationError } from "../../../shared/errors";

export class NextActionCannotBeSentError extends InvariantViolationError {
  constructor() {
    super("Only an activity with a text can be sent");
  }
}
