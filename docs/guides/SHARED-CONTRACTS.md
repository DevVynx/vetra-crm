# Shared Contracts

Conventions for `packages/contracts`, the Zod schema layer both `apps/api` and the
web app import from. Load this guide when adding or changing a request/response
shape.

## Ownership

`packages/contracts` is the **only** place a request/response shape is defined.
`apps/api`'s `validators.ts` wires these schemas into validation middleware
(`API-VALIDATION.md`); the web app's data layer imports the inferred types (and,
for forms, sometimes the schema itself). Neither side redeclares a shape locally —
if a shape needs to change, it changes here first.

## File shape

Files are grouped by resource under `src/<feature>/` (e.g. `contact.ts`, `list.ts`,
`detail.ts`), plus a `common.ts` for pieces shared within that feature (e.g. the
`Lead` shape itself). A schema file always exports the schema and its inferred type
together, request and response paired:

```ts
export const createLeadRequestSchema = z.object({ ... });
export type CreateLeadRequest = z.infer<typeof createLeadRequestSchema>;

export const createLeadResponseSchema = z.object({ lead: leadSchema });
export type CreateLeadResponse = z.infer<typeof createLeadResponseSchema>;
```

### Request/response pairing

- An endpoint that **sends** data (POST/PATCH) has a `...Request`; one that **returns** data
  has a `...Response`. The response is named after the endpoint even when it is just an
  existing entity schema, so API handlers and web calls are typed by endpoint:

  ```ts
  export const createLeadResponseSchema = leadSummarySchema;
  export type CreateLeadResponse = z.infer<typeof createLeadResponseSchema>;
  ```

- A read (GET) has only a `...Response`. Its filters and pagination travel in the query
  string and are validated by a `...Query` schema (e.g. `listLeadsQuerySchema`), not a
  request body.
- An endpoint that returns nothing (204) has no response.
- Entity schemas (`leadSummarySchema`, `leadNoteSchema`...) are building blocks and stay
  reusable; the endpoint-named responses point at them.

Each feature's files are re-exported through that feature's own `index.ts`, and the
package's `src/index.ts` re-exports every feature plus `shared/`.

## Validation rules

Prefer Zod's built-in checks (`z.email()`, `.min()`, `.max()`, ...) over a custom
`.refine()` wherever possible — built-in checks produce a stable `issue.code` the
frontend can turn into Portuguese text. A cross-field rule that can't be expressed
as a built-in check uses `.refine()`/`.superRefine()` with `message` set to a short,
stable, camelCase token (e.g. `"invalidDateRange"`) — **never a sentence**. See
`API-VALIDATION.md` for why.

## No backend dependencies

`packages/contracts` depends on `zod` only — no dependency on `packages/core` or
`apps/api`. This is what lets both the API and the web app depend on it without
pulling in unrelated code (the web app never needs `packages/core`, for instance).
Don't import anything from `packages/core` into `packages/contracts`, even something
that seems shared (put genuinely domain-only concerns in `packages/core` instead).

## The error response contract

`src/shared/errors.ts` defines `ValidationIssue` and the error response envelope —
this is the wire shape `apps/api`'s `handleGlobalError` actually sends
(`ERROR-HANDLING.md`), kept in `contracts` so both sides agree on its shape without
either one hardcoding it independently.
