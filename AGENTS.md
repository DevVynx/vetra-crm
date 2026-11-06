## Agentic Coding Guidelines for Vetra

**IMPORTANT: Read this entire file before starting any task.**

Vetra is a personal CRM for managing leads and client prospecting. It runs **locally**
and is used through the browser — there is no login and no hosted deployment. See
`docs/project/PROJECT-OVERVIEW.md` for scope and the decisions log.

---

## Project Overview

This is a TypeScript monorepo (pnpm workspace + Turbo) containing:

- **apps/api**: Express 5 REST API for this computer only (no authentication), which in production also serves the built web, Drizzle ORM over PostgreSQL
- **apps/web**: Vite + React 19 SPA, TanStack Router (file-based routing) + TanStack Query, Tailwind CSS + shadcn/ui. UI text is Portuguese, hardcoded (no i18n).
- **packages/core**: the domain layer — domain modules, services, repositories, and the `DomainError` hierarchy. Framework-agnostic, no HTTP/DB knowledge.
- **packages/contracts**: shared Zod schemas for request/response validation, consumed by every app
- **packages/infra**: technical capabilities with no business logic (today the WAHA client for WhatsApp; a future AI client would go here too)
- **packages/database**: Drizzle schema, migrations, and the configured DB client
- **packages/routes**: shared, typed route path constants consumed by every app
- **packages/config**: shared env validation (`client-vite`, `server`), plus ESLint, Prettier, and TypeScript base configs

**Stack**: TypeScript, Express 5, Drizzle ORM, PostgreSQL (Docker), Vite, React 19, Tailwind CSS

For more details about the project, see `docs/project/PROJECT-OVERVIEW.md`.

### Tasks

Work is planned as task files in `tasks/` at the repo root, named `VET-<n>.md`
(e.g. `tasks/VET-1.md`). Implement one task at a time and stay inside its scope.

---

## CRITICAL: On-Demand Guide Loading

This repository has detailed guides in `docs/guides/` for specific topics (listed in
full under "Deep-Dive Guides" below). You should only load these guides **when they are
relevant to the task you are performing**.

### When to Load a Guide

- **Load a guide ONLY when you need information from it** to complete the user's request
- **Do NOT load a guide** just because it exists or might be related
- **Do NOT load all guides** at the start of a session
- **Load guides based on the actual task at hand**

### How to Load Guides

Guides are referenced by path relative to the project root (e.g. `docs/guides/API-OVERVIEW.md`).
Resolve that path against the current project's root — never hardcode an absolute path,
since the repository can live in a different location on each machine.

### Recursive Loading

If a loaded guide references another guide for deeper details, load that guide too.

---

## CRITICAL: Always Ask Before Making Decisions

**STOP AND WAIT** — Never execute actions automatically, always confirm first.

### When to ALWAYS Ask

If at any point you need to do something that was not explicitly requested, **STOP and ASK**:

- Adding files to a commit that were not mentioned
- Modifying code that was not in the scope of the request
- Performing git operations (reset, stash, commit) without explicit confirmation
- Changing commit descriptions beyond what was requested
- Reverting code before confirming the scope

### What NOT to Do (Examples)

- ❌ User asks "adjust commit" → You add more files without asking which ones
- ❌ User asks "go back" → You modify code while doing the reset
- ❌ User asks something → You answer without verifying you understood correctly

### What TO Do (Examples)

- ✅ "Can I include file X in the commit as well?"
- ✅ "Do you want me to revert only file Y or all of them?"
- ✅ "Did I understand correctly that you want to do X with Y?"

### Golden Rule

> Better to ask 10 times than to make 1 wrong change.

---

## Quick Reference

### Build Commands

```bash
pnpm build          # Build all packages
pnpm dev            # Start all apps
pnpm lint           # Lint all packages
pnpm lint:fix       # Auto-fix linting
pnpm format         # Prettier --write on the whole repo, then lint:fix
pnpm check-types    # Type check all packages

# Single package
pnpm --filter <package-name> <script>
```

To run a command scoped to a single app/package, use `--filter <package-name>` and
check that package's own `package.json` for which scripts actually exist there before
assuming one is available.

---

## Code Quality Principles

Quality is always more important than delivery speed. These principles **MUST** be followed in every task.

### Net Positive Over Perfection

- Prioritize code quality, but do not block progress on minor imperfections
- A net improvement is better than perfect code that never ships
- Every commit should leave the codebase cleaner than you found it

### Grounded in Principles, Not Opinions

- Base every decision on established engineering principles (SOLID, DRY, KISS, YAGNI)
- If you are unsure about something, **ASK** — do not rely on assumptions or gut feelings
- Every architecture decision must have a clear rationale

### Security is Non-Negotiable

- Validate all inputs with Zod (`packages/contracts`) on both API and Web
- There is no authentication: the API must only be reachable from this computer: it listens on `127.0.0.1`, or, in the container, on `0.0.0.0` with the port published only on `127.0.0.1` (`compose.yaml`). The Host and Origin checks stay, and CORS only allows the web app's origin. Never publish the port to the network or widen CORS
- Never hardcode secrets, credentials, or tokens
- Never expose sensitive data in logs, error messages, or API responses

### Maintainability First

- Code is read far more often than it is written — prioritize clarity over cleverness
- Names must reveal intent; single responsibility per function/module
- Minimal nesting depth; favor early returns and guard clauses

### Comments

- Default to none. Most code should be self-explanatory from names and structure —
  don't add a comment that just restates what the next line already shows.
- Write one only for a genuinely non-obvious decision: a trade-off, a workaround for a
  specific framework limitation, an invariant that isn't visible locally, a gotcha
  someone will hit again (a unit mismatch, a restriction that only shows up at
  runtime, etc.).
- When that reasoning is long, or the same decision recurs across several files, put
  the full explanation in the relevant `docs/guides/` file and leave only a short
  pointer comment (e.g. `// see WEB-VITE-DATA-LAYER.md`) at each call site — don't
  duplicate a paragraph of narrative everywhere it applies.
- Never write a comment to explain _what_ code does; if it needs that, rename or
  restructure instead.

### TypeScript Strictness

- **No `any`** — use `unknown` and narrow appropriately
- **Strict Mode** — always follow TypeScript strict mode rules
- **`type` over `interface`** — prefer `type` for object shapes, except when interface is required

### Testing & Robustness

- Cover failure modes, edge cases, and error paths — not just happy paths
- Prefer meaningful tests that validate behavior, not implementation details

### Patterns

- **Domain logic**: lives in `packages/core`, framework-agnostic (no Express, no Drizzle types leaking in). Business rules belong to the domain module/service that owns the data, not to the caller.
- **API**: `apps/api` controllers handle HTTP concerns only (parse request, call a `packages/core` service, shape the response) — validation via `packages/contracts` Zod schemas, domain errors surfaced through the registry-driven `DomainError` → `HttpError` mapping (see `apps/api/src/shared/errors`), never ad-hoc try/catch per controller.
- **Web**: fetches/mutates through TanStack Query (`features/<name>/queries`, `features/<name>/mutations`), never ad hoc in a component. Every app page lives under the `_app` pathless layout route (the app shell).
- **Error Handling**: `HttpError` classes on API (mapped automatically from `DomainError` subclasses); on Web, `getErrorMessage` turns an error into Portuguese user-facing text, never a raw error message shown to the user.

For detailed patterns, see the guides in `docs/guides/`. For code reviews, use the `pragmatic-code-review` skill.

---

## Deep-Dive Guides

### API Guides

- `docs/guides/API-OVERVIEW.md` - Server setup, middleware, routing, error handling
- `docs/guides/API-MODULES.md` - Feature module pattern (controllers/services/repositories)
- `docs/guides/API-VALIDATION.md` - Zod validation patterns
- `docs/guides/DATABASE.md` - Drizzle schema, migrations, queries

### Web Guides

- `docs/guides/WEB-COMPONENTS.md` - shadcn/ui, component patterns
- `docs/guides/DESIGN-TOKENS.md` - Color system, shadcn/ui tokens, when to use each
- `docs/guides/WEB-VITE-OVERVIEW.md` - Vite/React structure, TanStack Router routing, layouts
- `docs/guides/WEB-VITE-DATA-LAYER.md` - TanStack Query patterns, axios client

### Cross-Cutting Guides

These span more than one layer — load them whenever the task touches the system they
describe, regardless of whether you're on the API or Web side.

- `docs/guides/DOMAIN-MODELING.md` - The reasoning behind `domain.ts` and the domain → service → controller → repository split
- `docs/guides/ERROR-HANDLING.md` - The `DomainError` → `HttpError` registry-driven mapping architecture
- `docs/guides/SHARED-CONTRACTS.md` - `packages/contracts`, the Zod schema contract between API and Web
- `docs/guides/ENV-CONFIG.md` - `packages/config/env`, client vs. server variables
- `docs/guides/AUTOMATIONS.md` - Sending the text of an activity by a click or by itself: the switches, the claim that never sends twice, the failures
- `docs/guides/PIPELINE-INTEGRATION.md` - How the prospecting pipeline talks to Vetra (lookup, upsert by slug, `doNotContact`, the text of an action)

### Practical Guides

- `docs/guides/ADDING-A-FEATURE.md` - End-to-end walkthrough of every file a new feature touches, across every layer

### Project

- `docs/project/PROJECT-OVERVIEW.md` - What the project is, current scope, decisions log

---

## Essential Reading by Task

| Task                         | Load These Guides                                                   |
| ---------------------------- | ------------------------------------------------------------------- |
| API development              | API-OVERVIEW, API-MODULES, DATABASE                                 |
| Adding a new feature         | ADDING-A-FEATURE (start here), then the relevant guides it links to |
| Writing/changing `domain.ts` | DOMAIN-MODELING                                                     |
| Domain/HTTP error work       | ERROR-HANDLING                                                      |
| Request validation           | API-VALIDATION, SHARED-CONTRACTS                                    |
| Database changes             | DATABASE                                                            |
| Web UI / styling             | WEB-COMPONENTS, DESIGN-TOKENS, WEB-VITE-OVERVIEW                    |
| Data fetching                | WEB-VITE-DATA-LAYER                                                 |
| New env variable             | ENV-CONFIG                                                          |
| API/Web integration          | SHARED-CONTRACTS, WEB-VITE-DATA-LAYER                               |
