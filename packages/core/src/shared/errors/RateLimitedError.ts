import { DomainError } from "./DomainError";

export class RateLimitedError extends DomainError {
  constructor(message: string = "Too many requests") {
    super(message);
  }
}
