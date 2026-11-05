# Env Config

How environment variables are read, validated, and shared. Load this guide when
adding a new environment variable or touching `packages/config/env`.

## Split by domain, not by runtime

`packages/config/env` has a **client** variant (`client-vite`, for `apps/web`), a
**server** variant (`apps/api`, `packages/database`) and a **waha** variant (the WhatsApp
service, for `packages/infra`). It's a **domain** split: the client variant is whatever
the web app itself needs to do its job (e.g. the API's URL); `server` is backend-only
concerns (`DATABASE_URL`). The web app should never need to import `server` just to get
its own API URL, even though nothing stops it technically — pulling in unrelated backend
secrets into the web app's dependency graph is the thing this split avoids. For the same
reason, database commands don't need the WAHA variables: only the API checks them, when
it boots.

The client variant's read mechanism (`import.meta.env`) and its Vite-specific
constraints are covered in `WEB-VITE-OVERVIEW.md`, not here.

## Same shape on both sides

Every variant (`client`, `server` and `waha`) exposes:

- `envConfig.get()` — lazily loads once, caches the result. Application code always
  calls this, never `process.env`/`import.meta.env` directly outside these files.
- `envConfig.set(overrides)` — override cached values (tests).
- `envConfig.reset()` — clear the cache.

## Required vs. defaulted variables

A required variable goes through the internal `get(key)` helper, which throws loudly
if the value is missing or empty — fail fast at boot, not with a confusing
`undefined` deep in application code. A variable with a sane default (e.g.
`API_PORT`, `WEB_PORT`) reads with `?? <default>` instead. Decide which behavior fits
before adding a new variable — most secrets and URLs should be required; ports
usually shouldn't be.

## Adding a new variable

1. Add it to `.env.example` at the repo root, with a short comment.
2. Add it to the relevant `ClientConfig`/`ServerConfig`/`WahaConfig` type and `load()` function —
   whichever variant actually owns the need for it.
3. If a build/tooling script needs to see it before the app boots, make sure that
   script's `env:load` (`dotenv-cli`) step actually loads the root `.env` — check the
   `package.json` script, don't assume it's automatic. See `WEB-VITE-OVERVIEW.md` if
   the variable needs to reach the browser specifically — that has its own rules.

## The WAHA variables

`WAHA_URL` and `WAHA_API_KEY` are required, and only the API reads them (through
`@vetra/env/waha`, used by `packages/infra`). Database commands work without them. The key
reaches WAHA through `compose.yaml`, so after changing it the service has to be recreated
(`docker compose up -d waha`). The key must never reach a log, an error message or an API
response: the WebSocket URL carries it, so it is built and used in one place and never printed.
