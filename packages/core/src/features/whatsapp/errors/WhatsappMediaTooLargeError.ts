import { InvariantViolationError } from "../../../shared/errors";

export class WhatsappMediaTooLargeError extends InvariantViolationError {
  constructor() {
    super("The media is larger than the limit");
  }
}
