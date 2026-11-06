# VET-17 — Introduction

## Objective

Greet whoever opens Vetra for the first time and ask for the two things the app cannot guess: their name and their time zone.

- **What:** a full-screen introduction in two steps, shown once, before the app.
- **Why:** a new install starts with the name "Maria Souza" (in the greeting of the Painel, in the initials of every entry and in the voice messages) and with Brasília as the time zone, which sets what "today" is, the due dates, the periods of the Painel and the dates of the export. Vetra is going to be run locally by other people, in other places.
- **Who benefits:** anyone who installs Vetra, and the user, who can see it again whenever they want.
- **Architectural direction:** a mark in the profile says whether the introduction was done. Nothing else is added.

---

## What is mandatory today

Nothing inside the app: it opens on the Painel with defaults (the profile "Maria Souza", `America/Sao_Paulo`, and the eight stages of the preset, all created when the API starts). The name and the time zone are the two defaults that are wrong for almost everybody. The photo, the WhatsApp connection, the stages and the import of data are optional and have their own places.

## Decisions already made with the user

- **Two steps:** (1) welcome, name (required) and photo (optional); (2) time zone, already set to the one of the browser, to confirm or change.
- **Not in the introduction:** connecting WhatsApp (it keeps its own screen, with the warning about the risk of a block), importing data and editing the stages.
- **It can be seen again** from Settings ("Introdução" → "Rever"). That also lets it be tried without touching the database.
- Starting Vetra with one command, the `.env` and the README are a separate task.

## Out of scope

- Anything about the `.env`, Docker or the migrations: if the app does not start, there is nothing to show.
- Choosing the language (the interface is in Portuguese only).

---

## How it works

- **The mark:** `profile.onboarded_at`, a nullable timestamp. A migration adds it and a second, custom one fills it for the profile that already exists, so nobody who already uses Vetra sees the introduction. On a new database the profile is created after the migrations, with the mark empty.
- **The API:** `POST /profile/onboarding` with the name and the time zone sets both and sets `onboarded_at` if it is empty (when it is not, it keeps the date: seeing it again only changes the name and the zone). The profile answer carries `isOnboarded`.
- **The web:** the layout of the app sends to `/welcome` while `isOnboarded` is false. `/welcome` is outside the layout, with no menu, and is always reachable.
- **The name** starts empty on the first time (never "Maria Souza"), and "Continuar" waits for it. **The time zone** starts as the one of the browser, when it is in the list.
- **Reuse:** the time zone field and the photo field, which only Settings used, move to `shared` because a second place needs them.

---

## Requirements

- One column and its two migrations, named; the data one is written by hand, as the database guide says. It must be applied with `db:migrate` on the real database, and the real profile ends up marked.
- No new dependency. No automated tests, as in the earlier tasks: checked in the browser and over HTTP with a temporary database, including the migration over a database that already has a profile.

## Acceptance Criteria

- On a new database the app opens on the introduction, with no menu, and "Continuar" is off until a name is typed.
- The second step shows the time zone of the browser already selected.
- Finishing saves both, goes to the Painel, which greets by the typed name, and the introduction does not come back after a reload.
- On a database that already had a profile, the introduction does not show.
- "Rever" in Settings opens it with the saved name and time zone, and finishing keeps everything else as it was.
