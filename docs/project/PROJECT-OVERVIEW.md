# Project Overview

## What Vetra is

Vetra is a personal CRM built to manage leads and the client-prospecting process of a
freelance developer selling development projects. It runs **locally** on the
developer's machine and is used through the browser.

It started from an internal monorepo template (domain → contract → API → UI layering);
the template's reference feature (authentication) was removed in `VET-1` because
Vetra doesn't need it.

## Scope

Planned capabilities, roughly in order:

- **Lead management** — register, organize, and follow leads through the commercial
  pipeline (stages, interactions timeline, next action / follow-up).
- **"Hoje" (today) view** — overdue and due follow-ups; the screen that drives the
  daily routine.
- **Dashboard** — pipeline overview and prospecting performance. Comes last, once
  there's real data to show.
- **Integration with the prospecting pipeline** — see "Relationship with the
  prospecting pipeline" below.
- **WhatsApp (WAHA)** — part of the first version, with its own "WhatsApp" tab: an
  inbox of conversations linked to leads (open a lead's chat, create a lead from a
  chat). Interface first, backend integration afterwards. The first cold approach
  stays manually sent.
- **AI-assisted text generation** (follow-ups, objection replies) — later; provider
  not decided.

## Stack

- **Backend (`apps/api`)**: Express 5 on Node.js, PostgreSQL (via Docker,
  `compose.yaml`) with Drizzle ORM.
- **Frontend (`apps/web`)**: Vite + React 19, TanStack Router and TanStack Query,
  Tailwind CSS + shadcn/ui. UI text is Portuguese, hardcoded.
- **Shared**: TypeScript everywhere, pnpm workspace + Turborepo, Zod as the contract
  between both ends.

## Architecture

- **`packages/core`** — domain logic, with no knowledge of HTTP, database, or
  framework. Business rules and domain errors live here.
- **`packages/contracts`** — request/response shapes as Zod schemas, imported by both
  the API and the web app.
- **`packages/database`** — Drizzle schema, migrations, and the configured client.
- **`packages/routes`** — API route paths as typed constants shared by back and front.
- **`packages/infra`** — technical capabilities the domain shouldn't know about
  directly. Empty for now; reserved for future integrations (WhatsApp, AI).
- **`packages/config`** — env validation plus base ESLint, Prettier, and TypeScript
  configs.
- **`apps/api`** — the HTTP layer: translates requests into calls to `packages/core`
  and domain errors into HTTP responses. No business rules of its own.
- **`apps/web`** — the interface: screens, forms, and its data layer
  (`WEB-VITE-DATA-LAYER.md`).

## Relationship with the prospecting pipeline

The developer prospects with a separate Claude Code project ("Pipeline de Captação":
`/captar`, `/produzir`, `/resultado`) that finds local businesses on Google Maps,
builds and deploys a branded demo site, and writes the WhatsApp approach message.

- **Vetra is the source of truth for each lead's state** (stage, interactions,
  follow-ups, outcome, metrics).
- **The pipeline keeps the files** (assets, demos, dossiers, approach texts).
- The two are linked by the lead's **`slug`**, which the pipeline already uses.
- Vetra does **not** reimplement the pipeline's agentic work (browsing, demo
  building, deploy). How the pipeline writes into Vetra is decided later.

## Decisions log

| Date       | Decision                                                                                                | Rationale                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-19 | No login / authentication.                                                                              | Local, single-person use. Removed from every layer in `VET-1`.                                                                                                                      |
| 2026-10-19 | API listens on `127.0.0.1` only; CORS allows only the web app's origin.                                 | Without authentication, network isolation is what protects the data.                                                                                                                |
| 2026-10-19 | Keep PostgreSQL (Docker).                                                                               | Already configured; Docker is needed anyway for WAHA. Switching to SQLite would be rework with no real gain.                                                                        |
| 2026-10-19 | UI in Portuguese, hardcoded, no i18n.                                                                   | Personal tool; i18n would be YAGNI. Backend stays language-neutral (stable error codes).                                                                                            |
| 2026-10-19 | Vetra may later be distributed to other people, but always **run locally**, never hosted.               | Not acted on yet. Keep data access isolated in repositories; packaging/installation for third parties is decided when that scenario is real.                                        |
| 2026-10-19 | Single `Lead` entity in the first version (no separate Opportunity).                                    | Selling more than one project to the same client is rare. Can be split later.                                                                                                       |
| 2026-10-19 | Vetra owns lead state; the prospecting pipeline owns files; linked by `slug`.                           | Avoids duplicating the pipeline's agentic work and its large template library.                                                                                                      |
| 2026-10-19 | WhatsApp: manual sending first; WAHA later, mainly for receiving.                                       | WAHA uses unofficial WhatsApp Web — automated cold outreach risks a number ban.                                                                                                     |
| 2026-10-20 | WhatsApp via WAHA moves into the first version, with its own nav tab; first cold approach stays manual. | Seen as a differentiator worth having from the start. Receiving/replying is low-risk; automated cold outreach would still risk a number ban. Supersedes the 2026-10-19 entry above. |
| 2026-10-19 | Build order: app shell → Leads screens with mock data typed by contracts → backend → dashboard.         | See the product before building the logic; the dashboard needs real data.                                                                                                           |

## Important notes

- **The backend is language-neutral.** Hand-written backend messages are in English
  and use stable codes (error class name, Zod `issue.code`). Turning them into
  Portuguese text is the web app's job (`getErrorMessage`).
- Work is planned in `tasks/VET-<n>.md`, one task at a time.
