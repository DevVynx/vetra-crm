# API Overview

Server setup, middleware order, routing, and the conventions that hold `apps/api`
together. Load this guide for any task that touches `apps/api/src/app.ts`,
`server.ts`, or the overall request lifecycle.

## Entry points

- `src/server.ts` — process entry point, starts the HTTP server on `127.0.0.1` only.
  There is no authentication, so network isolation is what protects the data — never
  change the host to `0.0.0.0` or make it configurable without revisiting that
  decision (see the decisions log in `PROJECT-OVERVIEW.md`).
- `src/app.ts` — builds and configures the Express app: this is where every global
  middleware and router gets wired, in a specific order (see below). Don't scatter
  `app.use(...)` calls anywhere else.

## Middleware order matters

`app.ts` wires things in this order, and new middleware should respect it:

1. `rejectForeignHost` and `rejectForeignOrigin` — see "Protecting a local API" below.
2. `express.json()` — body parsing must happen before anything that reads `req.body`.
3. `cors({ origin: FRONTEND_URL })` — only the web app's own origin. There is no
   authentication, so don't widen this.
4. `helmet(...)`.
5. Feature routers, mounted under `/api`.
6. `notFoundHandler` — catches anything no router matched.
7. `handleGlobalError` — **must be last**. It's the only place a thrown error becomes
   an HTTP response (see `ERROR-HANDLING.md`).

## Protecting a local API

The API has no authentication and holds private conversations, and any site open in the
user's browser can reach `127.0.0.1`. Listening only on that address isn't enough:

- **`rejectForeignOrigin`:** CORS only stops a site from reading the response. A POST with
  no JSON body needs no preflight, so it would still run. Any request with effects that
  carries another `Origin` gets a `403`. Requests with no `Origin`, like a local script,
  aren't from a site and stay allowed.
- **`rejectForeignHost`:** with DNS rebinding, a site points its own domain at
  `127.0.0.1` and becomes same-origin with the API. Only `127.0.0.1:<port>` and
  `localhost:<port>` are accepted as `Host`.

## Env access

Always go through `envConfig.get()` from `@vetra/env/server` — never read
`process.env` directly in application code. See `ENV-CONFIG.md`.

## Routing

Each feature owns one `Router` in `src/features/<name>/routes.ts`, mounted onto the
app under `/api`. A route line is built from, in order: the path constant (from
`@vetra/routes`, never a literal string), the validator, any extra middleware, then
the controller:

```ts
leadsRouter.post(leadsRoutes.create, v.createLead, createLeadController);
leadsRouter.get(leadsRoutes.byId, v.getLead, getLeadController);
```

See `API-MODULES.md` for the full feature shape (controllers, validators, helpers).

## Error handling — no try/catch in controllers

Controllers and services never catch an error to translate it manually. They `throw`,
and Express 5 automatically forwards a rejected promise to `handleGlobalError`. Do not
add a catch-and-`next(err)` wrapper — it's redundant with native Express 5 behavior and
just adds noise. Full mechanics in `ERROR-HANDLING.md`.

## Path alias

`@/*` resolves to `apps/api/src/*` (see `tsconfig.json`). This alias is local to
`apps/api` — it is **not** available inside `packages/*`; see the note in
`API-MODULES.md` about why shared packages use relative imports instead.

## File organization

`src/shared/` groups cross-feature code by concept, one small file per concern:
`errors/` (the domain-error registry and its mapper), `http/` (HTTP error classes,
validation middleware), `middlewares/` (404, global error handler). Keep this granularity for new
cross-cutting code — don't pile unrelated helpers into one file.

## Serving a file from a third party

A file someone else sent (a WhatsApp image, document or audio) must never be able to run in the
page, whatever it says it is. The WhatsApp media route is the model:

- **An allowlist of types may be shown inline** (`jpeg`, `png`, `webp`, `gif`, `mp4`, `webm` and a few
  audio types). Anything else, `html` and `svg` included, is sent as an attachment with a generic type.
- **Headers:** `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none';
sandbox`, `Cache-Control: no-store`, and a file name with no control character, quote or slash.
- **A size cap** applied while reading, so a huge file is refused without being loaded.
- **Only the path the upstream gives is used,** on the address already trusted, and only under the
  folder it should come from. The host in the URL it returns is ignored.
- **Nothing is stored:** the file is asked for, handed over and forgotten.
