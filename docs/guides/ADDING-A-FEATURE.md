# Adding a Feature — End to End

A practical walkthrough of every file a new feature touches, in order. `leads` is the
reference: every layer below has real `leads` code to read alongside this guide.

Plain exported functions only, with no factories and no classes except errors: one file
per query or action, grouped by a barrel, with the rules in `domain.ts`.

Each step below links to the guide with the actual conventions for that layer —
read the relevant one before writing the files, don't just copy the shape blindly.

## 1. Domain — `packages/core/src/features/<name>/`

See `API-MODULES.md` and `DOMAIN-MODELING.md`.

- `domain.ts` — the domain module: entity type, invariants, pre/post-conditions, and
  every pure computation derivable from the entity's own data (e.g.
  `features/leads/domain.ts` owning stage-transition rules).
- `errors/` — concrete error classes extending the right category from
  `packages/core/src/shared/errors` (e.g. `LeadNotFoundError extends NotFoundError`).
- `helpers/` — feature-local utilities a service needs but that aren't a domain rule
  or a use case on their own.
- `repositories/` — one file per query, grouped via `index.ts` into a
  `<name>Repositories` object. Only needed if the feature persists data.
- `services/` — one file per action, grouped via `index.ts` into a `<name>Services`
  object.
- `index.ts` — re-export `errors` + `services` (not `repositories`).

## 2. Database — `packages/database/src/schema/<name>.ts`

See `DATABASE.md`. Only if the feature needs its own table. Reuse `common.ts`'s
column helpers, then `pnpm --filter @vetra/database db:generate --name=<what_it_does>` and
`db:migrate`.

## 3. Contracts — `packages/contracts/src/<name>/`

See `SHARED-CONTRACTS.md`. Request/response Zod schemas + inferred types, re-exported
from the package's `index.ts`.

## 4. Infra — `packages/infra`, only if needed

Most features won't touch this. Only add something here if the feature needs a
technical capability the domain layer shouldn't own directly (e.g. a WhatsApp or AI
API client).

## 5. Route constants — `packages/routes/src/<name>.ts`

Add the feature's path constants here first — a controller/route file never uses a
literal route string.

## 6. API — `apps/api/src/features/<name>/`

See `API-MODULES.md` and `API-VALIDATION.md`.

- `controllers/` — one file per action, exporting `<action>Controller`, barrel
  `index.ts`.
- `validators.ts` — default-exported `v` object built from the contracts schemas.
- `helpers/` — shaping domain entities into responses (e.g. `leadResponses.ts`), when more
  than one controller needs it.
- `routes.ts` — wire path constant + validator + middlewares + controller.
- Mount the new router in `apps/api/src/app.ts`, under `/api`.

## 7. Web — `apps/web/src/features/<name>/`

See `WEB-VITE-DATA-LAYER.md` and `WEB-COMPONENTS.md`.

- `queries/` / `mutations/` — one hook per resource/action, calling the API through
  `shared/lib/axios/api.ts` with paths from `@vetra/routes`.
- `components/` — the feature's screens/forms. UI text in Portuguese, and dates in the
  profile time zone (`WEB-VITE-OVERVIEW.md`).
- A new route file under `apps/web/src/routes/_app/` (every app page lives under the
  `_app` layout).

## 8. Error mapping — usually nothing to do

See `ERROR-HANDLING.md`. A new concrete domain error is mapped to an HTTP error
automatically through its category — only touch
`apps/api/src/shared/errors/domainErrorRegistry.ts` if one specific error needs a
different HTTP status than its category's default.

## Sanity check before calling it done

`pnpm check-types` and `pnpm lint` across the whole monorepo — a feature that spans
this many layers is where a small mistake (a missing export, a mismatched contract
type) tends to surface as a type error somewhere unexpected.
