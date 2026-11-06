# VET-23 — Publish Vetra as a ready image

## Objective

Let someone install Vetra by downloading a small package, with no source code and no build, while the repository stays public for whoever wants to read or modify it.

- **What:** a license, an automatic publication of the Docker image on every version tag, a small installer package attached to each release, and the compose file and scripts adjusted so the same files serve both people (who pull the image) and developers (who build it).
- **Why:** VET-18 makes Vetra run built, but only by building it on the user's computer from the source (a slow first run, and it needs the whole repository). Users should only pull an image that is already built.
- **Who benefits:** anyone who installs Vetra, and the owner, who ships a version by tagging it.

## Decisions already made with the user

- **The repository and the image are public.** The code is visible, but the license forbids selling, hosting for third parties or redistributing Vetra without permission. Moving to a private repository later stays possible.
- **The license is source-available, not MIT.** MIT would let anyone resell Vetra. The proposal is **PolyForm Shield 1.0.0** (allows use, including in a business, and modification; forbids competing with Vetra). _Pending the user's confirmation against PolyForm Noncommercial._ The user should have the final text reviewed by a lawyer before selling.
- **Users download a small release package** (compose file, scripts, `.env.example` and a README written for them), never the repository.
- **Updating from a button in Settings is VET-24.**

## Confirmed with the user

- **License:** PolyForm Shield 1.0.0, copyright holder "Vinicius (DevVynx)". The file is the official text with the
  `Required Notice:` line on top. It goes in the repository, in the installer package, inside the image and in the
  `license` field of `package.json`. The README says in plain words what it allows. A lawyer should review it before selling.
- Docker project name fixed to `vetra-crm` in `compose.yaml` (`name:`), so the folder name stops mattering and the owner's existing volumes (`vetra-crm_*`) are kept.
- Image: `ghcr.io/devvynx/vetra-crm`.
- Apple Silicon is declared **not verified** until someone tests it (the README says so).
- **First version: 0.1.0**, with a trial `v0.1.0-rc.1` first.

## What was done and checked

`LICENSE`, `package.json` (`license`), `compose.yaml` (fixed project name, `image` next to `build`, `WAHA_IMAGE`), the
`Dockerfile` (`VETRA_VERSION`, OCI labels, the license copied in), the launchers (build when a Dockerfile is next to them,
pull otherwise; `WAHA_IMAGE` on arm64), `scripts/montar-instalador.sh` and `packaging/env.example` (the installer package),
`.github/workflows/release.yml`, and the README (for users, with the license) split from `CONTRIBUTING.md` (for developers).

Checked without publishing: the workflow with `actionlint` (clean); the image built locally with a test version (label,
`VETRA_VERSION` and `LICENSE` inside it); the package built and extracted (it has no Dockerfile, and has `.env.example`,
`LICENSE`, `README.md`, `compose.yaml` and the scripts); the extracted package started with `--no-build` in an isolated project
(other names and port, `down -v` afterwards): the three services healthy, the 29 migrations applied, API and web answering;
the two scripts' syntax. The real database, containers and volumes were not touched.

## Still to do, with the owner's approval (it is outward-facing)

1. Push the repository to GitHub, and create the trial tag `v0.1.0-rc.1`: the workflow publishes the multi-arch image and
   the pre-release. Check the run, then pull the image on a clean setup and use the real launcher.
2. Set the GHCR package `vetra-crm` to **public** (once, in the GitHub package settings), or nobody can pull it.
3. Tag `v0.1.0` for the first real release.
4. Not verified here: the `arm64` build and WAHA's arm image (Apple Silicon), and the Windows launcher against a pulled image.

## Out of scope

- The update button, the version check and the backup before updating (VET-24).
- Signing images, a private registry or license keys.
- Windows ARM, other languages, a desktop app.

---

## How it works

- **License.** A `LICENSE` file with the chosen text, a `license` field in the root `package.json`, and a short note in the README about what is allowed.
- **Publication.** A GitHub Actions workflow on tags `v*`: builds the `Dockerfile` for `linux/amd64` and `linux/arm64`, pushes to GHCR with the tags `X.Y.Z` and `latest`, then creates the GitHub Release with the installer package attached. Free for a public repository. One manual step, once: set the package to public in GHCR.
- **The version** comes from the tag and is written into the image (build argument), so the app can show it and VET-24 can compare it.
- **One compose file.** The `app` service gets `image: ghcr.io/devvynx/vetra-crm:${VETRA_VERSION:-latest}` next to `build: .`. The scripts choose: with a `Dockerfile` next to them (a clone) they build; without it (the package) they pull. Checked: Compose accepts `build: .` with no Dockerfile when started with `--no-build`, so **one `compose.yaml` serves both** (no generated copy).
- **Installer package** (`vetra-instalador.zip`): `compose.yaml`, `scripts/`, `.env.example` and a README for users. Built by the workflow, so it never drifts from the repository.
- **WAHA on Apple Silicon.** The pinned WAHA image is amd64 only; `devlikeapro/waha:arm` exists for arm64. The image name comes from a variable (`WAHA_IMAGE`) and `iniciar-vetra.sh` sets it on arm64.
- **README split.** The root README is for users first. Development goes to `CONTRIBUTING.md`.

## Requirements

- No new runtime dependency in the app.
- `pnpm dev` and the compose services `db` and `waha` keep working unchanged.
- The workflow is checked as far as possible without publishing: build of both architectures locally if Docker allows it, then a pre-release tag (`v0.0.1-rc.1`) on the real repository, with the owner's approval first, since publishing is outward-facing.
- Nothing is tested against the real database, containers or volumes.

## Acceptance Criteria

- Tagging `vX.Y.Z` publishes an image with `X.Y.Z` and `latest` for amd64 and arm64, and a Release with `vetra-instalador.zip`.
- On a clean computer with only Docker, extracting the package and double clicking `iniciar-vetra` brings Vetra up at `http://localhost:4720` without a build.
- The owner's current data (`vetra-crm_*` volumes) is still used after the change.
- `LICENSE` is in the repository and the README says what it allows.
