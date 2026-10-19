# Web Overview

Vite/React structure, routing, and app-wide setup for `apps/web`. Load this guide for
any task that touches `apps/web/src/main.tsx`, routing, or a new global provider.

## Entry point

`main.tsx` imports `index.css` as a side-effect first, then mounts
`<RouterProvider router={router} />` inside `StrictMode`.

## Routing — TanStack Router, file-based

Routes live under `src/routes/`. `src/routeTree.gen.ts` is **auto-generated** by the
router Vite plugin from that folder's contents — never hand-edit it, and don't worry
if it looks stale in a diff during local dev; it regenerates on file changes (and on
`vite build`).

`__root.tsx` wraps the whole app once in `AppProviders` and renders `<Outlet />` — this
is where a new _global_ concern (a provider, a persistent top-level UI element) goes,
never wrapped ad hoc inside an individual route.

### The `_app` layout

`_app.tsx` (leading underscore = pathless layout, no URL segment) is the app shell
every page renders inside. A new page is a file under `routes/_app/`. There is no
authentication, so this layout has no `beforeLoad` guard — it exists to host shared
layout (navigation, page frame), not access control.

## Providers

`shared/providers/AppProviders.tsx` composes every app-wide provider in one place:
`QueryClientProvider`, `ThemeProvider`, the global `Toaster`, and dev tools. A new
cross-cutting concern (state, theming, etc.) is added here, not sprinkled across
individual routes or components.

## Path alias

`@/*` resolves to `apps/web/src/*`. Same convention as `apps/api`'s alias — see the
note in `API-MODULES.md` about why this alias does **not** exist inside `packages/*`.

## UI language

All UI text is Portuguese, written directly in the components — there is no i18n
layer (see the decisions log in `PROJECT-OVERVIEW.md`). The backend stays
language-neutral; turning an API error into Portuguese text is `getErrorMessage`'s
job (`WEB-VITE-DATA-LAYER.md`).

## Environment variables

`@vetra/env/client-vite` only works from code that Vite itself
bundles/serves — actual application source under `apps/web/src`. It reads
`import.meta.env`, and that object is only populated by Vite's own dev-server/build
pipeline; nothing else injects it.

A **config or tooling file that runs in plain Node, before any bundling happens**
(`vite.config.ts`, for instance) is not part of that pipeline, even though it lives
inside `apps/web`. `import.meta.env` is not populated there — calling
`client-vite`'s `envConfig.get()` from a file like that throws the moment it hits a
required field, because the whole `ClientConfig` object is computed eagerly and
every field is missing.

The rule, in one line: **code the browser bundle actually ships → `client-vite`
(`import.meta.env`, never `process.env` directly). Config/tooling code that runs in
Node before the bundle exists → read `process.env` directly, with its own local
default, never through `client-vite`.** That's why `vite.config.ts` reads
`Number(process.env.WEB_PORT ?? 3000)` directly, and `WEB_PORT` isn't part of
`ClientConfig` at all — no application code running in the browser needs to know its
own dev server's port. See `ENV-CONFIG.md` for the broader client/server package
split this fits into.

## Folder shape

- `features/<name>/{components,queries,mutations}` — everything specific to one
  feature. See `WEB-VITE-DATA-LAYER.md` for queries/mutations.
- `shared/components/ui/` — shadcn/ui primitives (see `WEB-COMPONENTS.md`).
- `shared/components/` — composed components used across more than one feature.
- `shared/lib/` — `axios/` (HTTP client), `tanstack/` (query client + utils).
- `shared/providers/`, `shared/utils/`.

A component or hook used by exactly one feature belongs under that feature's folder,
not under `shared/` — promote it to `shared/` only once a second feature needs it.
