# VET-24 — Update Vetra

## Objective

Let the user see which version is running, learn that a newer one exists and update it without a terminal, with a backup first and a way back if the new version does not start.

- **What:** the version shown in Settings, a check against the public GitHub releases, and an update script the user double clicks.
- **Why:** after VET-23 users run a published image. Updating by hand means a terminal, which these users do not use.
- **Who benefits:** non-technical users, and the owner, who stops supporting old versions.

## Decisions (with the user)

- **A script, not a button.** The first design was a button in Settings, with a small helper container that holds the Docker socket and swaps the app. It was dropped: access to the Docker socket is control of the computer, Vetra has no login, and it would need a second image, a second public package, a resident service and a way to update the updater. The script does the same work on the user's computer, with no new container and no extra exposure.
- **The button can still come later,** on top of this: the version check, the backup and the way back would be reused, and only a resident updater would be added.
- **Backup and automatic way back:** yes. The backup is a `pg_dump` kept in a `backups` folder next to the installer (visible, and it survives the Docker volumes being removed). The 5 most recent are kept.
- **Only the stable releases are offered** to someone on a stable version. Someone on a pre-release (`0.1.0-rc.1`) is also offered newer pre-releases and the stable one that follows. An older version is never offered.
- **The package fixes the version it was made for** in its `.env.example`, so an installation does not float to `latest` by itself; the update script is what changes it.

## How it works

- **Version.** The image knows its version (VET-23, `VETRA_VERSION`). Settings → Atualizações shows it; a build outside an image shows "Desenvolvimento" and does not check.
- **Check.** `GET /api/updates` reads the public GitHub releases (no key, a generic client name, 5 s timeout), compares by semantic versioning and answers `{ currentVersion, canCheck, checkFailed, hasUpdate, latestVersion, releaseUrl, publishedAt }`. It never fails: offline, a limit of the service or a strange answer is `checkFailed`, shown as "could not check". The result is kept for 6 hours (2 minutes after a failure); "Verificar agora" reads again, at most once every 30 seconds.
- **The script** (`atualizar-vetra-windows.bat` with `win-auxiliar-atualizar.ps1`, and `atualizar-vetra-mac-linux.sh`) asks the running Vetra for the version to install (so the comparison lives in one place), or takes one as an argument (`atualizar-vetra-windows.bat 0.2.0`, `--yes`/`-Yes` to skip the question), then:
  1. pulls the new image (nothing is touched and no backup is made if it cannot be had);
  2. makes the backup, checked inside the container for the line `pg_dump` writes at the end of a complete dump (a failed dump piped into `gzip` would leave an empty file that looks fine);
  3. swaps the app and waits up to 3 minutes for it to answer;
  4. if it does not, brings back the previous image, says so, and names the backup;
  5. on success (or after going back) writes the version in `.env`.
     It refuses in a folder that has the source code (`Dockerfile`), without a `.env`, for a text that is not a version, and when it cannot tell which version is installed (it could not go back).
- **Limit:** a migration that already changed the database is not undone by returning the image. The backup covers that case, and the README explains how to restore it.

## What was done and checked

`VETRA_VERSION` and `VETRA_RELEASES_URL` in the server config, the releases client in `infra`, the version rules and the check with its cache in `core/updates`, the contract, route and `GET /api/updates`, the Atualizações section in Settings, the three scripts, the package (fixed version, the scripts), `backups/` in `.gitignore`, and the README (updating and restoring), `ENV-CONFIG.md` and the overview.

Checked, never against the real database, containers or volumes:

- **Version rules** (17 cases): a newer stable, the highest of several, `0.10.0` over `0.9.0`, pre-releases skipped for a stable user, no downgrade, `rc.10` over `rc.9`, the stable after its rc, `dev`, a strange tag, no releases.
- **The API** with a fake list of releases: the stable offered and not the pre-release or the draft; the generic client name; the cache and the 30 second limit; a 500, a body that is not JSON and an answer that is not a list (a rate limit) as "could not check"; junk inside a list; going back to up to date.
- **The screen** in Chrome: update available (with the link to the release), failed check, up to date, and the development build (no button).
- **The scripts**, in an isolated folder with a local registry and fake images (two that start, one that does not): bash (26 checks) and PowerShell plus the `.bat` (19 checks): the update finds the new version by itself; the backup is a valid gzip holding the user's data; the data is intact after the swap; `.env` is updated and keeps its other lines; "already the newest"; a version that does not start goes back, keeps `.env` and names the backup; a version that does not exist touches nothing and makes no backup; only the 5 latest backups remain; an invalid version, a source tree, no `.env`, an answer "no" and a stopped app are refused.
- **The restore** described in the README, in an isolated Postgres.

Two defects were found by these tests and fixed: PowerShell turned docker's progress (written to the error output) into a failure under `$ErrorActionPreference = "Stop"` and aborted before the backup; and `pg_dump | gzip` exited 0 when the dump failed, leaving a 20 byte "backup".

## Not verified

- A real update between two published versions: it needs two published versions that both have the script, so it can only be done after the next pre-release is published.
- The launchers of Windows and macOS clicked on a clean computer.

## Out of scope

- A button in the app that updates, updates without a click, release notes editing, downgrading by choice, a private registry.
