# API Validation

How request validation works and the conventions a new Zod schema must follow. Load
this guide when adding an endpoint's validation or writing a new schema in
`packages/contracts`.

## Ownership

`packages/contracts` owns every request/response shape as a Zod schema. `apps/api`
never redefines a shape — `validators.ts` only wires an existing contracts schema into
the `validation(...)` middleware. See `SHARED-CONTRACTS.md` for the contracts-side
conventions.

## The `validation()` middleware

`apps/api/src/shared/http/validation.ts` exports `validation({ body?, query?, params?,
headers? })`. It `safeParse`s each provided schema against the matching part of the
request; on any failure it collects every issue and throws a single
`BadRequestError("Validation failed", issues)` — never `res.status(400).json(...)`
by hand in a controller.

## Issue shape

Each collected issue is `{ path, code, params? }`:

- `code` is Zod's own stable `issue.code` for built-in checks (`too_small`,
  `too_big`, `invalid_type`, `invalid_format`, ...) — this is already
  language-neutral, nothing to translate on the API side.
- A custom `.refine()`/`.superRefine()` has no native code (Zod reports `"custom"`).
  By convention, its `message` is used as the stable token instead of prose — e.g. a
  cross-field date check sets `message: "invalidDateRange"`, not a sentence. This is the single most important rule in this guide: **never put a
  human-readable sentence in a schema's `message`.** The frontend turns the code into
  Portuguese text (`getErrorMessage`); a sentence baked into the schema would leak
  backend wording into the UI.
- `params` is a defensive, allow-listed subset of the issue's own fields
  (`minimum`, `maximum`, `expected`, `received`, ...) — only present when the specific
  issue actually carries them, used for interpolation on the client
  (e.g. "at least `{{minimum}}` characters").

## Typing a validated request

Controllers type their request via `ValidatedRequest<typeof v.xxx>` (from
`shared/http/validation.ts`), which infers `body`/`query`/`params`/`headers` straight
from the validators object — never hand-declare a request body type in a controller.

```ts
export async function createLeadController(
  req: ValidatedRequest<typeof v.createLead>,
  res: Response<CreateLeadResponse>
) { ... }
```

## What not to do

- Don't validate anything by hand in a controller — if it needs validating, it belongs
  in a `packages/contracts` schema wired through `validators.ts`.
- Don't put a literal, human-readable error message in a Zod schema anywhere
  (`.min(1, "campo obrigatório")` etc.) — rely on the stable `issue.code`, or a stable
  `message` token for custom refinements.
