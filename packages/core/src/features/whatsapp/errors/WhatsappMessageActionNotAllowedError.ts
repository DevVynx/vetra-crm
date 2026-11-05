import { InvariantViolationError } from "../../../shared/errors";

export class WhatsappMessageActionNotAllowedError extends InvariantViolationError {
  constructor() {
    super("The action is not allowed on this message");
  }
}
