# VET-24 — Update Vetra from Settings

## Objective

Let the user see which version is running, learn that a newer one exists and update with a button in Settings, with a backup first and a way back if the new version does not start.

- **What:** the version shown in Settings, a check against the public GitHub releases, an "Update" button, and a small helper container that does the update.
- **Why:** after VET-23 users run a published image. Updating by hand means a terminal, which these users do not use.
- **Who benefits:** non-technical users, and the owner, who stops supporting old versions.

## Decisions already made with the user

- Updating is a button in Settings that fetches the new version and says whether Vetra is already up to date.
- The repository and the image are public (VET-23).

## Proposed, pending confirmation

- **Automatic backup and rollback** (the user did not answer yet).
- Keep the last 5 backups.

## Out of scope

- Automatic updates without a click, release notes editing, downgrading by choice, a private registry.

---

## How it works

- **Version.** The image knows its version (VET-23). Settings shows it.
- **Check.** The API asks the public GitHub releases API for the latest release (no key) and compares. Failures (offline, rate limit) are shown as "could not check", never as an error screen. The result is cached for a while.
- **The server must not hold the Docker socket.** Whoever opens a server with no login would control the computer. Only a separate **updater** container has it, started with the app, with the socket and nothing else.
- **Update flow** (the app asks the updater, which does):
  1. Backup of the database (`pg_dump`) into the data volume.
  2. Pull the new image. The updater only accepts images of the official repository, and only the tag it was asked for, from a semver check.
  3. Recreate the app container; migrations run at startup (VET-18).
  4. Wait for it to become healthy. If it does not, **go back to the previous image** and say so.
- **Progress** is shown in the web (updating, restarting, done or rolled back); the page reconnects when the server returns (the lost-server notice already exists).
- **Limit:** a migration that already changed the database is not undone by returning the image. The backup is what covers that case, and the message tells where it is.

## Requirements

- The updater is small, with no network exposure.
- Verified with an isolated compose project (other names, ports and volumes), a fake older image and a fake newer one that fails its health check to prove the rollback. Never the real containers.

## Acceptance Criteria

- Settings shows the version and whether a newer one exists.
- The button updates a running installation and keeps its data.
- A new version that does not become healthy is rolled back automatically and the user is told.
- The app container has no access to the Docker socket.
