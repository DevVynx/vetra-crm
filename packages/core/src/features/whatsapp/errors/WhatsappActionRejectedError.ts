import { InvariantViolationError } from "../../../shared/errors";

export class WhatsappActionRejectedError extends InvariantViolationError {
  constructor() {
    super("WhatsApp rejected the action");
  }
}
