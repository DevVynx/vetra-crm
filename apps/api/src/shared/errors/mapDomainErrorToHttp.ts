import { HttpError } from "@/shared/http/errors";

import { domainErrorRegistry } from "./domainErrorRegistry";

// Walks the error's prototype chain from its concrete class up through its ancestors,
// returning the first registered match. This means an exact-class registration always
// wins over a category-level one, with no manual ordering needed.
export function mapDomainErrorToHttp(error: unknown): HttpError | undefined {
  if (!(error instanceof Error)) return undefined;

  let proto = Object.getPrototypeOf(error) as object | null;

  while (proto && proto !== Object.prototype) {
    const factory = domainErrorRegistry.get(proto.constructor as new (...args: never[]) => Error);
    if (factory) return factory(error);

    proto = Object.getPrototypeOf(proto);
  }

  return undefined;
}
