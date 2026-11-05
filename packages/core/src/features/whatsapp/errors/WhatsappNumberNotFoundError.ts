import { InvariantViolationError } from "../../../shared/errors";

export class WhatsappNumberNotFoundError extends InvariantViolationError {
  constructor() {
    super("This number is not on WhatsApp");
  }
}
