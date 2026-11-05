# Error Handling

The domain-error → HTTP-error architecture. This is the signature piece of the
backend architecture, and it spans two packages — load this guide before
adding a new error anywhere in the API/domain layers, not just when something breaks.

## Two hierarchies, on purpose

**Domain errors** (`packages/core/src/shared/errors`): `DomainError` (abstract) →
category subclasses `NotFoundError`, `ConflictError`, `InvariantViolationError`,
`RateLimitedError` and `ServiceUnavailableError`.
A concrete error (e.g. a future `LeadNotFoundError`) always
`extends` a _category_, never `DomainError` directly and never plain `Error`.

**HTTP errors** (`apps/api/src/shared/http/errors.ts`): `HttpError` (base, carries
`status` and an optional `ValidationIssue[]`) → one subclass per status code
(`BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`,
`ConflictError`, `UnprocessableEntityError`, `TooManyRequestsError`,
`InternalServerError`, `BadGatewayError`, `ServiceUnavailableError`).

These two hierarchies intentionally reuse some names (`NotFoundError`,
`ConflictError` exist on both sides, meaning different things) — that's not a naming
collision to "fix", it's why `apps/api/src/shared/errors/domainErrorRegistry.ts`
imports them under aliases (`NotFoundError as DomainNotFoundError`, `NotFoundError as
HttpNotFoundError`).

Both base classes set `this.name = new.target.name` in their constructor. This is
load-bearing: it's how the registry tells concrete errors apart without a manual
discriminant field, and it's why every concrete error must be a real `class X extends
Y` — never a factory function that returns a plain `Error` with a custom message.

## The bridge: the registry

`domainErrorRegistry.ts` is a `Map` from a domain error **category** constructor to a
factory that builds the matching `HttpError`. `mapDomainErrorToHttp.ts` walks the
thrown error's prototype chain and returns the first registered match.

This means a brand-new concrete domain error is mapped automatically through its
category the moment it's defined — **zero registry changes needed** for the common
case. Only add an entry to the registry when one _specific_ concrete error needs a
different HTTP status than its category's default (the registry currently maps at the
category level only; nothing needs a per-error override yet).

## Categories for things outside our control

`ServiceUnavailableError` (503) is for a dependency that isn't there, like WAHA being off.
`RateLimitedError` (429) is for a limit someone else imposes, like WhatsApp restricting
messages to new contacts. The web shows Portuguese text for both, and never the raw message.

`packages/infra` has its own plain errors (`WahaUnavailableError`, `WahaSendRestrictedError`,
`WahaRequestRejectedError`), because it must not know the domain. The domain wraps them in
`helpers/callWaha.ts`, the only place that translates: a refusal from WhatsApp on an edit or a
delete (`WahaRequestRejectedError`) becomes an `InvariantViolationError` (422), while WAHA being
off becomes `ServiceUnavailableError`. A media that WhatsApp no longer serves is a
`NotFoundError` (404), and one over the size limit an `InvariantViolationError` (422). So the same
status can mean different things per
route, and the web picks its message by the action (`whatsappErrorMessage` and
`whatsappMessageActionErrorMessage`).

## Where errors are thrown — no try/catch to translate

Services and controllers never catch a domain error to convert it — they just
`throw`. Express 5 automatically forwards a rejected promise to `handleGlobalError`
(native Express 5 behavior, nothing custom wires this). `handleGlobalError` is the
single place a thrown error becomes an HTTP response:

- If it's an `HttpError` (already mapped, or thrown directly by a controller/
  middleware for something that isn't a domain concern — e.g. `BadRequestError`
  from the validation middleware), respond with its `status`/`message`/`issues`.
- Anything else is logged server-side and answered as a generic 500 — never leak an
  unmapped error's message to the client.

## Layer boundaries

`packages/core` never imports `HttpError` or anything from `apps/api`.
`apps/api`'s controllers never construct a `DomainError` — the two hierarchies only
meet inside `apps/api/src/shared/errors/`. If you find yourself importing an HTTP
error class into `packages/core`, or a domain error class into a controller to check
its type manually, that's a sign the registry should be handling it instead.
