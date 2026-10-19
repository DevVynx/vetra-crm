import {
  ConflictError as DomainConflictError,
  InvariantViolationError,
  NotFoundError as DomainNotFoundError,
} from "@vetra/core";

import {
  ConflictError as HttpConflictError,
  HttpError,
  NotFoundError as HttpNotFoundError,
  UnprocessableEntityError as HttpUnprocessableEntityError,
} from "@/shared/http/errors";

type ErrorConstructor = new (...args: never[]) => Error;
type HttpErrorFactory = (error: Error) => HttpError;

// Maps domain error *categories* (from packages/core/src/shared/errors) to HTTP errors.
// A new concrete domain error automatically resolves here through its category via
// mapDomainErrorToHttp's prototype-chain walk — nothing to register unless a specific
// error needs a different status than its category's default.
export const domainErrorRegistry = new Map<ErrorConstructor, HttpErrorFactory>([
  [DomainNotFoundError, (error) => new HttpNotFoundError(error.message)],
  [DomainConflictError, (error) => new HttpConflictError(error.message)],
  [InvariantViolationError, (error) => new HttpUnprocessableEntityError(error.message)],
]);
