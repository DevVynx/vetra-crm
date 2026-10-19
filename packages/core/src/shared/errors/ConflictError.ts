import { DomainError } from "./DomainError";

export class ConflictError extends DomainError {
  constructor(message: string = "Resource conflict") {
    super(message);
  }
}
