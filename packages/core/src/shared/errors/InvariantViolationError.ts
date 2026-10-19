import { DomainError } from "./DomainError";

export class InvariantViolationError extends DomainError {
  constructor(message: string = "Invariant violation") {
    super(message);
  }
}
