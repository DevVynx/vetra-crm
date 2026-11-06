# VET-25 — A separate Docker compose for development

## Goal

Development and the built app (VET-18) should not share Docker volumes, containers or ports. Today the dev
Postgres and WAHA are easy to mix up with the ones of the built app, and two servers using the same WhatsApp
number could both run the automatic sending (VET-20) at the same time.

## Idea (from the conversation, to be decided with the user)

- A compose file only for development, with its own project name (for example `-p vetra-dev`), so volumes and
  networks never collide with the built app.
- Its own volumes for Postgres and for the WAHA session.
- Ports that do not conflict (4720 already belongs to the built app).
- Only Postgres and WAHA: the API and the web keep running with `pnpm dev`, outside Docker.
- The dev WAHA needs a session of its own. Scanning the same number's QR in both makes one drop the other, so
  testing should use a test number, or keep the dev WAHA off while the built app is in use.

## Decided

- **Names:** `compose.dev.yaml`, project `vetra-dev`, containers `vetra_dev_postgres` and `vetra_dev_waha`, volumes
  `vetra-dev_postgres_data` and `vetra-dev_waha_sessions`. `compose.override.yaml` is gone: `compose.yaml` is only the
  built app, so a plain `docker compose up` no longer publishes any port.
- **Ports:** the same as before (database 5432, WAHA 3001, `VETRA_DB_PORT` and `VETRA_WAHA_PORT`), so `.env` does not change.
- **Commands:** `pnpm docker:dev` and `pnpm docker:dev:down`.
- **Existing data:** copied to the development volumes (the current ones, `vetra-crm_*`, are left untouched).
- **No lock in the automatic sending** for a number shared by two servers: separate stacks and sessions lower the risk a lot,
  and a lock would be a feature of its own.

## What was done and checked

`compose.dev.yaml`, the removal of `compose.override.yaml`, the two scripts, and the README, `.env.example`, `ENV-CONFIG.md` and
`compose.yaml` text. Checked both compose files with `docker compose config`, and the dev one in an isolated project (other
name and ports): both containers healthy, volumes of its own, migrations applied, WAHA answering, and the current containers and
volumes untouched.

## Not in this task

Anything about the content of the built image (VET-23) or the update button (VET-24).
