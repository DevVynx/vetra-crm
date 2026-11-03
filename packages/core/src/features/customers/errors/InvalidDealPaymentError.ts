import { InvariantViolationError } from "../../../shared/errors";

export class InvalidDealPaymentError extends InvariantViolationError {
  constructor() {
    super(
      "The received amount cannot exceed the closed value, and installments need a first due date"
    );
  }
}
