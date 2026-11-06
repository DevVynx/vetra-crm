# VET-18 — Run Vetra built, in Docker

## Objective

Let someone who is not a developer run Vetra with one double click, from a build, with no Node and no terminal, and have it come back by itself when the computer turns on.

- **What:** Vetra becomes a Docker service next to Postgres and WAHA: one image that holds the API and the built web, a launcher script, and a README written for people who don't program.
- **Why:** today Vetra only runs in development (`pnpm dev`: Vite and `tsx watch`), and its build does not produce anything that runs on its own. Vetra is going to be run locally by other people, some of them not technical.
- **Who benefits:** anyone who installs Vetra, and the user, who stops keeping two dev servers open.
- **Architectural direction:** the only thing to install is Docker Desktop, which Vetra already needs for Postgres and WAHA. Development (`pnpm dev`) stays as it is.

---

## What is wrong today

- The API build (`dist/server.js`) leaves `@vetra/core`, `@vetra/contracts` and the other workspace packages as imports, and their entry is TypeScript source, so plain Node cannot run it.
- The web build has the API address written inside it (`VITE_API_URL`), and the API does not serve it: web and API are two origins, with CORS between them.
- Migrations only run through `drizzle-kit`, a development tool.
- The address `127.0.0.1` is fixed in the API; there is no Dockerfile and no way to start it without a terminal; `.env` is made by hand, with the WAHA key changed by hand; and `pnpm db:seed` wipes every lead without asking.

## Decisions already made with the user

- **Everything in Docker** (the app, Postgres and WAHA). No Node, no pnpm for whoever installs it.
- **The security rules are relaxed**, since it is local. Inside the container the API listens on every interface (the only way a published port reaches it); the port is published only on this computer (`127.0.0.1` in the compose file), so nothing else on the network can reach a server with no login. The Host check against DNS rebinding stays, since it costs nothing.
- **The address people see is `localhost`**, not an IP.
- **An unusual port, `4720`**, only so it does not clash with something else. It is fixed in `compose.yaml` and in the launcher scripts (an earlier version read it from `.env`, which nobody needed).
- The repository will be public. **Updating from a button in Settings** is a separate task (VET-22), decided after looking at how.
- The prospecting pipeline comes after this.

## Out of scope

- Updating (VET-22) and the automatic backup before a migration, which belongs to it.
- The pipeline, a desktop app, other ports or languages.

---

## How it works

- **One server process.** The API serves the built web (with the usual fallback to `index.html` for the screens, never for `/api`), so everything is one origin and the web calls `/api`, a relative address: the same build works on any port.
- **The build is one file.** `tsup` bundles the workspace packages and the libraries, so the runtime image has no `node_modules`.
- **Migrations run when the server starts,** only when `VETRA_AUTO_MIGRATE=true` (the compose file sets it). In development nothing is applied unasked, as the database guide asks.
- **Compose:** a service `app`, in the compose profile `app`, so `docker compose up -d` for development does not start a second API that would also sync WhatsApp. The launcher uses the profile. Containers restart by themselves, and Docker Desktop can open at sign-in, which is what brings Vetra back when the computer turns on.
- **The launcher** (`scripts/iniciar-vetra-windows.bat` (which calls `win-auxiliar.ps1`), and `scripts/iniciar-vetra-mac-linux.sh` for macOS and Linux, kept out of the root of the repository) checks that Docker is running, makes `.env` with a random WAHA key the first time, starts the services, waits until Vetra answers and opens the browser. `parar-vetra` takes them down (`docker compose down`, never `-v`): the containers and the network go and the data stays in its volumes, so a stopped Vetra does not come back by itself when Docker restarts (with `restart: always`, a container only stopped would).
- **`db:seed`** now refuses to run on a database that already has leads, unless `--yes` is given.

---

## What was found while checking it

- **The health check cannot use `localhost`:** inside the container it resolves to IPv6 (`::1`), and the server listens on IPv4, so the check was refused and the container never became healthy. It uses `127.0.0.1`, and so do the launcher's waits. The address people open stays `localhost`.
- **Git Bash rewrites `/api` into a path** (`C:/Program Files/Git/api`) when it launches a program with it as a variable: a web build made by hand there needs `MSYS_NO_PATHCONV=1`. The Docker build is not affected.
- **A file of `/assets` that does not exist is a 404, not the page.** An older tab asking for an asset a new build no longer has would otherwise get HTML where it expects a script.
- **A container kept from an earlier run can point to a network Docker has replaced.** After a change in `compose.yaml` the project network was made again and the old `vetra_app` still pointed to the old one, so starting it failed with "network not found" (found on the second run of the launcher). The launcher now starts the database and WhatsApp first (`up -d --wait db waha`, left alone if nothing changed) and always makes the app again (`up -d --build --force-recreate --no-deps app`). Not reproduced in isolation: the cause comes from the stale network id in the failed container; the fix is confirmed by running the launcher again.
- **Checked** with the compiled server on Node alone, then with the image and the real `compose.yaml` in an isolated copy (other names, no database or WAHA ports, other volumes): 22 migrations applied from an empty database, the app as a non-root user, data and photo surviving a restart and a `down`/`up`, the port refused from the network address, and the launcher's logic with a fake `docker` in four situations (no Docker, Docker closed, first run, own key kept).
- **Not checked, and only the real thing can:** that Docker Desktop opens at sign-in and brings the containers back, and the first build on a computer that has never built it.

## Requirements

- No new runtime dependency in the app (the build tool and the migrator already come with the project).
- The development flow (`pnpm dev`, the compose services `db` and `waha`) keeps working unchanged.
- No automated tests, as in the earlier tasks. Each step is checked with a temporary database, a fake WAHA, and finally the real image in Docker with its own names, ports and volumes, never the real ones.

## Acceptance Criteria

- `docker compose --profile app up -d --build` brings Vetra up at `http://localhost:4720`, on an empty database, with its tables created by itself and the introduction showing.
- The launcher does that with a double click and opens the browser.
- Restarting Docker brings Vetra back by itself.
- `pnpm dev` still works as before.
