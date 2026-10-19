# API Modules — Feature Pattern

How a feature is structured across `apps/api` and `packages/core`. Load this guide
when adding a new API endpoint or a new domain feature. For the practical end-to-end
walkthrough, see `ADDING-A-FEATURE.md`; this guide documents the conventions each
piece follows.

## A feature is split across two layers

- `packages/core/src/features/<name>/` — the domain layer: entity, services,
  repositories, errors. No Express, no HTTP, no Drizzle types leaking in.
- `apps/api/src/features/<name>/` — the HTTP layer: controllers, routes, validators,
  helpers. Translates HTTP in, calls into `packages/core`, translates the result back
  to HTTP. Contains no business logic of its own.

## `apps/api/src/features/<name>/`

- **`controllers/`** — one file per action, named `<action>.ts`, exporting a single
  function named `<action>Controller` (e.g. `createLead.ts` → `createLeadController`).
  A barrel `index.ts` re-exports all of them. A controller reads `req.body`/
  `req.params`/`req.query`, calls exactly one `packages/core` service, and returns
  `res.json(...)`.
- **`validators.ts`** — default-exports an object (conventionally named `v`) mapping
  action name → a `validation({...})` middleware built from `packages/contracts`
  schemas. Controllers import `type v` only, to type `req` via
  `ValidatedRequest<typeof v.createLead>` — they never call `v.createLead` directly, the router
  does. See `API-VALIDATION.md`.
- **`routes.ts`** — one `Router` per feature. See `API-OVERVIEW.md` for line order.
- **`helpers/`** — feature-local utilities that don't belong in `shared/` (e.g.
  shaping a query string into service filters).

## `packages/core/src/features/<name>/`

- **`domain.ts`** — **this is the domain module, not a DTO file.** It's where the
  entity's type lives, yes, but more importantly it's where the entity **owns
  itself**: every invariant, every pre/post-condition, and every pure computation
  derivable from the entity's own data belongs here, as functions that take the
  entity as an argument (grouped into a `<name>Domain` object, e.g.
  `leadDomain.create`). If some piece of code needs to check or derive something
  about a `Lead`, that logic should live in `domain.ts` and be called from there —
  not be re-implemented inline in a service. Read `DOMAIN-MODELING.md` before adding
  to this file — it walks through the full reasoning: data derived instead of stored,
  invariants enforced by the entity's own module instead of trusted from the caller,
  boundaries respected between two domain modules. No classes — domain data stays a
  plain object, behavior stays a pure function operating on it.
- **`errors/`** — one class per concrete error, each `extends` the right _category_
  from `packages/core/src/shared/errors` (never `DomainError` directly, never plain
  `Error`). See `ERROR-HANDLING.md`.
- **`helpers/`** — feature-local utility functions that support a service but aren't
  themselves a domain invariant or a full use case (e.g. normalizing a phone number
  before a lookup). This is the same idea as `apps/api/src/features/<name>/helpers/`
  one layer up — a place for a small, feature-scoped utility that
  doesn't belong in `shared/` (not reused across features) and doesn't belong in
  `domain.ts` (it's a technical detail, not a rule about what a `Lead` is) or
  `services/` (it's not a use case on its own, just something a use case calls).
- **`repositories/`** — one file per query, exporting a single function (e.g.
  `findLeadById.ts` → `findLeadById`). A barrel `index.ts` groups them into a
  `<name>Repositories` object (`leadRepositories.findLeadById(...)`). Repositories are
  the only place `@vetra/database` gets imported.
- **`services/`** — one file per action, exporting a single async function. The
  input type is declared locally right above the function, lower-camelCase (e.g.
  `type createLeadInput = {...}` above `createLead`) — it is **not** imported from
  `packages/contracts`; core has no dependency on contracts. A service coordinates:
  it calls repositories for persistence and `domain.ts` for the actual rules — it
  should not contain a business rule itself that domain.ts could own instead. A
  barrel `index.ts` groups services into a `<name>Services` object.
- **`index.ts`** — re-exports `errors` and `services` only. Repositories are an
  implementation detail services use internally, not part of the feature's public
  surface — don't export them from the feature's `index.ts`.

## Relative imports inside `packages/*`

Every non-app package (`core`, `contracts`, `infra`, `database`, `routes`) uses plain
relative imports (`../../leads/repositories`), never a `@/` path alias. This is
deliberate: `tsx`/`tsc` resolve one `tsconfig.json` per process, based on the
process's working directory — a package's own alias works when type-checked in
isolation but silently breaks when consumed from another app's process.
Don't add a `@/` alias to a package under `packages/`; only `apps/api` and `apps/web`
have one.
