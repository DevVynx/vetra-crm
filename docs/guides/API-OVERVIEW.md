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
- **The origin of the app is accepted written either way** (`localhost` or `127.0.0.1`, same port), so
  someone who typed the IP is still at home.

Where it listens: on this computer only (`API_HOST`, `127.0.0.1`), or, in a container, on every
interface with the port published only on this computer (`127.0.0.1:<port>` in `compose.yaml`). The
second is the same exposure, since only a container's own address is reachable from outside it.

## Serving the built web

When `WEB_DIST_DIR` is set (the container), the API also serves the web build, so everything is one
origin and the web calls `/api` with a relative address. The files in `/assets` have a hash in their
name and are cached for a year; `index.html` is never cached, or an update would not show. Every
**address of a screen** (no extension, not under `/api`) answers `index.html`, so a screen opened by its
own address works; a file that does not exist (an asset of an older page) is a 404, never the page,
which a script would choke on. This goes after the API routes and before the 404 handler.

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

## Receiving a file

A file reaches the API as the **bytes of the request**, not as JSON or a form, so no library is
needed and nothing is read until it is known to be small enough. It is used by the WhatsApp files
and voice messages, the profile photo and the import of data.

- **`rawFileBody(maxBytes)`** reads the body as a `Buffer` whatever its type, and a body over the
  limit is a clear 422, not a 500. It goes **after** the validator of the route, so a request that is
  wrong in its address is refused without reading the file.
- **What describes the file travels in the query** (name, type, length, caption), validated with Zod
  like any query. The real type is not the `Content-Type`, which is always
  `application/octet-stream`, so a JSON file is never read by `express.json()`.
- **The limit is also checked by the domain**, since it is a rule and not only a transport detail. The
  domain has its own copy of the number (core does not import the contracts); the two are commented
  to be kept equal.
- **A file that is read by hand is not trusted:** the import reads a zip with `readZip`, which checks
  the sizes before opening, caps what opens, verifies every checksum and refuses encrypted and
  Zip64 zips. Only the files it wants are opened.

## Files the API owns

The few files Vetra keeps itself (today the profile photo, `profile-photo.webp`) live in
`STORAGE_DIR`, written through `@vetra/infra`: a temporary file renamed over the real one, so a
half-written file is never read. They are never in the database or in `apps/web`.

The photo is the **one file served to an `<img src>`** (see "Files asked for on demand" in
`WEB-VITE-DATA-LAYER.md`): it is the user's own avatar, small, and is shown in many places. Its route
answers `Cross-Origin-Resource-Policy: cross-origin`, `nosniff` and a long cache, and its address
carries a version (`?v=`) that changes with the photo. A page on another site could ask for it, but
cannot read it; it could only learn that a photo exists. Do not copy this for anything else.
