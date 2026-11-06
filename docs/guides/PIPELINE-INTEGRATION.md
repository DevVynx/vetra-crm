# Prospecting pipeline integration

How the prospecting pipeline (`captacao-pipeline`, a separate Claude Code project) talks to Vetra.
Load this guide when touching the routes below, the `slug` or `do_not_contact` columns, or the
`body` of a next action. The decisions behind it are in `tasks/VET-19.md`.

## The rules

- **The pipeline works alone.** Vetra is optional for it. Every call has a short timeout and a
  failure sends the pipeline back to its own files, so nothing here may make Vetra a requirement.
- **With Vetra running, it holds the state of a lead.** The pipeline keeps what is not lead state: the
  text of the approach, the identity, the result and its learnings.
- **Nothing is sent automatically.** The user sends every message, from Vetra's screen.
- **No lead without a phone.** The pipeline does not prospect a business with no phone, and the phone
  is required and unique in Vetra. A landline is valid (8 to 15 digits; mobile is not told from
  landline).
- **A candidate the user rejects never reaches Vetra.**

The pipeline calls from outside a browser (no `Origin`), on `127.0.0.1` or `localhost` with the port,
so the Host and Origin checks need nothing special.

## The contract

All under `/api`, with the paths in `packages/routes` and the schemas in
`packages/contracts/src/leads/pipeline.ts`.

- **`GET /system`** answers `{ name: "vetra", apiVersion: 1 }`. A pipeline that gets anything else
  (or nothing) works without Vetra.
- **`GET /leads/lookup?slug=&phone=&name=&city=`** answers the leads that match, each with its stage,
  `doNotContact` and `matchedBy`. `slug` and `phone` (repeatable) are sure matches; the phone is
  compared by its canonical key, which ignores the ninth digit. `name` with `city` is a **hint**,
  equal ignoring case and accents, never a reason by itself to discard anything. `name` alone (no `city`) finds the
  leads whose name **contains** it, ignoring case and accents (`matchedBy: ["name"]`): it is for when the user names
  a lead that was typed by hand and so has no slug, and the pipeline shows the candidates for the user to confirm.
- **`PUT /leads/by-slug/:slug`** is an idempotent upsert, answering `{ created, conflict, lead }`
  (201 when it created, 200 otherwise):
  - New slug: creates the lead in the entry stage. `nextAction` (optional) is created with it, in
    the same transaction, and **only then**: an existing lead never gets one, so repeating the call
    never duplicates it. `prospectedAt` keeps the real date of an old prospect.
  - Existing slug: replaces the demo link (the one field the pipeline owns) and fills `contactName`
    and `email` only when they are empty. It never changes the name, niche, city, phone or stage, so
    what the user edited stays.
  - `doNotContact` is accepted only as `true`, also on an existing lead. `false` is ignored: only
    the user turns it off.
  - A new slug whose phone belongs to another lead creates nothing and answers
    `{ created: false, conflict: "phone", lead }` with the lead that owns the number.
  - `nextAction` is `first_approach` or `follow_up` (a follow-up needs `followUpStep`); `dueAt` may be
    past or future and defaults to now; `description` is a short title and `body` the text.
- **`PATCH /leads/:id/do-not-contact`** is the user's switch (Leads page, "Ações do lead").
- The note with the gap goes through `POST /leads/:id/notes`.

## Follow-ups

`PUT /leads/by-slug/:slug` also takes the follow-up texts and a moment (VET-22). **The pipeline only gives the texts, in the
order they go. Everything else (how many are kept, when each is sent) is Vetra's.**

- `followUps`: up to 3 items `{ body }`, `body` 1..4000 characters (a `step`, if sent, is ignored: the order is the array).
  More than 3 items, or an empty or too long text, is a 400.
- **Vetra keeps the first ones, as many as its limit says** (Settings → Automações, 0 to 3, default 1). With a limit of 2 it
  keeps the first two texts; with 0, none (`ignored: "follow_ups_off"`).
- `approachSentAt`: when the opening message was **already sent outside Vetra**. It cannot come with a `nextAction`
  (400), and `followUps` without a `nextAction` need it (400, `followUpsNeedAnOpening`).
- Vetra creates each text as the activity "Follow-up N" when the previous message is sent or completed, due after the wait
  of its position (Settings, default 2, 3 and 5 days, each from the previous send). With `approachSentAt` the first one is
  made at once, due that moment plus its wait, even if it is already in the past.
- **Only once per lead.** Once any row exists the follow-ups are never taken again, so repeating the call changes nothing.
  This also works for a lead that exists: `/vetra-sync` sends the missing texts and `approachSentAt`.
- The response has `followUps: { queued, ignored }`. `ignored` is `null` or `already_has`, `replied` (the lead wrote after
  `approachSentAt`), `not_in_funnel` (archived, customer), `do_not_contact`, `needs_approach_sent_at` (an existing lead that
  came with a `nextAction`, which is ignored for it) or `follow_ups_off`. None is an error.
- The lead of the response, and of `GET /leads/lookup`, carries `followUps: [{ step, status }]`, `step` being the position
  (1, 2, 3) and `status` `queued`, `scheduled` or `cancelled`. A reply or leaving the funnel cancels what is queued.
- A text with `[SEU WHATSAPP]` is kept parked and never sent by itself, as for any activity.

## Reading a lead's conversation

`GET /leads/:id/messages?limit=` is the one way the pipeline reads WhatsApp, and only for `/resultado`, when the
user asks for it. It answers `{ hasConversation, hasMore, messages }`, the most recent `limit` messages (200 by
default, 500 at most) oldest first, each with only `direction`, `type`, `text` and `sentAt` (plus `isDeleted`; a
deleted message has no text). No ids, no media, no photo, no name of the contact.

- It starts from a **lead**: the conversation is found by the lead's phone, so a chat that is not a lead's cannot be
  asked for. There is no route by conversation, by phone or by search on this path.
- A lead with no linked conversation (or with WhatsApp never connected) answers `hasConversation: false`, and the
  pipeline asks the user to paste it instead.
- Only what Vetra imported is there: individual conversations of the last 12 months. Audio, image and the like show
  as a type, with no content (a caption, when there is one, is the text).
- This does not make the rest of the API safe from the pipeline: with no login, `/whatsapp/*` is open to anything on
  this computer. The pipeline keeps a closed list of the routes it may call, and this is the only WhatsApp one.
  `GET /leads/:id/conversation` (the 4 messages of the lead's card) stays, but is not what it should use.

## What guarantees no duplicate lead

The database, not the code: a unique index on the canonical phone key (`leads_phone_key_idx`) and
another on `slug` (`leads_slug_idx`). Two requests that race for the same slug or phone are settled
by the index, and the loser is answered as the existing lead or as the phone `conflict`, never as an
error. What nothing guarantees: the same business with **two different phones or slugs** is two leads.
The lookup by name and city is only the hint for that.

## The text of an action

A next action has a one-line `description` (a title, cut in lists) and an optional `body` of up to
4000 characters, kept with its line breaks and shown whole, with a copy button, inside a lead. It is
exported and imported (`texto` in `atividades.csv` and `atividades_concluidas.csv`) and kept in the
history of completed actions.

## Import and export

`leads.csv` has `slug` and `nao_contatar` (sim/nao). In the import `etapa` is optional (a lead without
it goes to the entry stage, so a file made elsewhere does not depend on the name of a stage). A row
whose slug already exists, or repeats inside the file, is skipped like a repeated phone.
