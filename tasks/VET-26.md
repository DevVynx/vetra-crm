# VET-26 — A demonstration environment

## Objective

Show Vetra to other people with data that looks real, without risking the real database and without a real WhatsApp.

- **What:** `pnpm demo:up` starts a separate Vetra (own database and volumes, port 14720) filled by the seed, with a fake WhatsApp whose
  conversations match the leads; `pnpm demo:down` removes it.
- **Why:** the seed wipes every lead, the real Vetra has no port for the database, and the fake WhatsApp used in the tests was a throwaway
  fixture. A presentation needs all three, repeatable.

## Decisions (with the user)

- **A separate environment, not the real Vetra.** The real database was empty, so seeding it would have wiped nothing, but a fake
  WhatsApp there would have filled it with invented conversations (and Vetra refuses to change WhatsApp account while it keeps
  conversations). A separate stack leaves the real Vetra and its WhatsApp untouched.
- **Some activities carry a text**, as the pipeline writes them, to show the flow with the pipeline: a first approach in bubbles, follow-ups,
  one with `[SEU WHATSAPP]` (parked, never sent by itself) and follow-ups waiting in the queue (VET-22).

## What was done and checked

`demo/` (the compose file, the fake WAHA, the conversation maker and the `up`/`down` script), the seed with the texts and the queued
follow-ups, the scripts in `package.json`, `docs/guides/DEMO.md`. Checked: `demo:up` from nothing (twice, to prove it starts from scratch);
20 conversations imported and all linked to their leads; and the story end to end: sending the Padaria's first approach moves it to
"Abordagem enviada" and makes its follow-up an activity, and the fake lead's answer 25 seconds later moves it to "Conversando" and cancels
the follow-up. Screens captured in Chrome. A bug found by the check: the second run kept the first run's test conversation, since the seed
does not wipe the WhatsApp tables; `demo:up` now starts from scratch.

## Out of scope

Media, groups and any real WhatsApp event in the fake; a demo of the update.
