import { DomainError } from "./DomainError";

export class ServiceUnavailableError extends DomainError {
  constructor(message: string = "Service unavailable") {
    super(message);
  }
}
