# VET-22 — Follow-ups from the pipeline

## Goal

The prospecting pipeline writes up to three follow-up texts and hands them to Vetra together with the lead.
Vetra keeps them, and creates each one as an activity when the previous message goes out, with the wait counted
from that moment. Sending is still VET-20's job (click or automatic), and a reply cancels what is left (VET-21).
The pipeline is not a server Vetra can call, so everything it knows must arrive in the `PUT /leads/by-slug/:slug`
call. **The contract below is a proposal: it changes only with agreement between both sides and the user's approval.**

## Decisions (from the user, relayed with the pipeline's side)

- **At most 3 follow-ups per lead, as a hard ceiling** (too many messages risks a flood and a blocked number). Within
  that, the quantity is a setting (0 to 3, default 1) and the **waits** are settings too.
- **No roles or steps in the contract:** the pipeline's own plan (light reminder, a new angle, the last touch) is its
  business. Vetra receives the texts in the order they go.
- **The pipeline writes the texts; Vetra owns the timing and the sending.** Each text up to 4000 characters, each
  blank-line-separated block is one WhatsApp bubble (as in VET-20).
- **Waits are Vetra's**, configurable, counted from the **send of the previous message** (not from the lead's creation).
- **The marker `[SEU WHATSAPP]`** is replaced by the pipeline before the call; if one arrives with it, Vetra keeps it
  parked, as it already does (never sent by itself).
- **Default waits: 2, 3 and 5 days**, each counted from the send of the previous message (so 2, 5 and 10 days in
  total from the opening). "The send" is the moment the activity is completed, whether Vetra sent it or the user
  marked it done. The wait is the one of the text's position (first, second, third).
- **An old lead whose first due is already in the past gets it due now** (sent at once if its switch is on); the
  following ones are counted from that real send.
- **Only what the pipeline hands over is capped at 3.** Activities the user writes by hand are not restricted: people
  use `follow_up` as a plain task, and Vetra cannot tell the difference.
- **The pipeline gives only the texts, in order; Vetra decides how many are kept and when each goes** (the user
  restated this after a proposal of the pipeline's side to add the wait of a skipped step, which is moot: roles and
  steps are not Vetra's business). The contract carries no step: the order of `followUps` is the order they go. A setting
  `followUpLimit` (0 to 3, default 1, the recommended: more follow-ups risk a blocked number) says how many are kept: with 2, the first two texts; with 1, only the first.
- **Prerequisites already done (VET-21):** a reply deletes the lead's pending follow-ups (default on), and a lead with
  "Não contatar" is never sent anything by itself.

## Contract proposal: `PUT /leads/by-slug/:slug`

Two new optional fields next to the existing `nextAction`:

```json
{
  "businessName": "...",
  "nextAction": { "type": "first_approach", "...": "..." },
  "followUps": [
    { "body": "Oi, passando só para lembrar..." },
    { "body": "Última mensagem, depois não incomodo mais..." }
  ],
  "approachSentAt": "2026-10-20T14:00:00-03:00"
}
```

- `followUps`: up to 3 items `{ body }`, in the order they go; `body` trimmed, 1..4000 characters. Any other shape is a
  400 (more than 3 items, an empty text, a text over 4000). No `step`: Vetra numbers them 1..N after applying its limit.
- `approachSentAt` (optional, ISO with offset): when the opening message was **already sent** outside Vetra. It is the
  moment the first wait is counted from, for a lead that has no opening activity in Vetra.
- **Which combinations are valid:**
  - **New lead with `nextAction`:** the opening is that activity. The wait of the first step starts when it is sent
    or completed. `approachSentAt` must not be present (400).
  - **Lead with no `nextAction` and `followUps`:** `approachSentAt` is required (400 `followUpsNeedAnOpening`), since
    nothing else says when to start counting.
- **Idempotency:** follow-ups are taken **only if the lead has none yet** (not queued, not pending, not already done).
  Sending the same call again changes nothing. This holds for an existing lead too, which is how `/vetra-sync` can give a
  follow-up plan to an older lead: it sends only the steps still missing and `approachSentAt`. For an existing lead
  that has replied, is archived, is a customer or is marked "Não contatar", follow-ups are ignored.
- **Response:** the usual lead plus `followUps`: `{ "queued": 2, "ignored": null }`, where `ignored` is `null` or one
  of `"already_has"`, `"replied"`, `"not_in_funnel"`, `"do_not_contact"`. Nothing is an error: the lead is still upserted.
- **Lookup (optional, only if the pipeline asks):** `GET /leads/lookup` could add `followUps: [{ step, status }]` with
  status `queued | pending | done`, so `/vetra-sync` knows which steps are missing.

## How Vetra schedules

1. The texts are kept in a new table `queued_follow_ups` (lead, step 1..3, body, status `queued | scheduled |
cancelled`), unique per lead and step. A row is never deleted when it is used or cancelled, so "the lead already has
   follow-ups from the pipeline" stays true and a repeated call cannot queue them again.
2. When an activity of the lead completes (its text was sent by click or automatically, or the user marked it done) and
   the lead has queued steps, Vetra takes the **lowest queued step** and creates the activity `Follow-up <n>`
   (`type = follow_up`, `followUpStep = n`) with its body, due at **completion time + the wait of that step**.
   Creating it is one transaction with removing it from the queue.
3. For a lead started with `approachSentAt`, the first activity is created at once with
   due = `approachSentAt + wait`; if that is already in the past it is simply overdue (sent at once if the lead's
   switch is on) and the next waits count from its real send.
4. The **waits** are three numbers of days in Settings → Automações (always applied, even while the master switch is
   off, since creating an activity is not sending), defaults 2, 3 and 5. They have no upper limit.
5. **A reply** (VET-21) also cancels the queued steps (status `cancelled`). **A lead leaving the funnel** (archived,
   closed) cancels them too, along with its pending activities. **Reopening** a just-completed activity puts back in
   the queue the follow-up it had created and deletes that activity, so an undo does not leave a follow-up for a message
   that was not sent.
6. "Arquivar quem não responde" keeps working: while a follow-up is pending the lead is not archived, and the last
   one pending is the last text, so the N days start after it.
7. The limit of 3 applies only to what comes from the pipeline. By hand the user can add as many activities as they
   want, of any type.

## Plan

- Database: `queued_follow_ups` and a migration; the waits in `automation_settings`.
- Core: the follow-up rules (steps, limit, the scheduling after a completion, the idempotency), a repository for the
  queue, the hook after a completion (`deliverNextAction` and the manual completion) and in the undo; delete the queue on
  a reply and when the lead leaves the funnel.
- Contracts/API: the two request fields, the response field (and the lookup field if agreed); validation errors as above.
- Web: the three waits in Settings; show the step (`Follow-up 2 de 3`) in the activity.
- Docs: `PIPELINE-INTEGRATION.md` (the new fields), `AUTOMATIONS.md` and the decisions log.
- Test (throwaway stack, fake WAHA): the validation cases; creation with `[1,2,3]`, `[1,3]`, `[3]`; the chain of
  schedules with the waits; reply cancelling the queue; archive and close cancelling it; the undo; an old lead with
  `approachSentAt` (including a date so old that the due is in the past); the second call changing nothing; an
  existing lead that replied or is "Não contatar" ignoring them; hand-made follow-ups unrestricted.

## What was done and checked

Migration 0026 (`queued_follow_ups`, the three waits), core (the queue, the scheduling on completion, the undo, the
cancelling on a reply and on leaving the funnel, the upsert for new and existing leads, the lookup), contract and API
(`followUps`, `approachSentAt`, the response and the lookup field), and the three waits in Settings → Automações. Checked in
a throwaway stack with a fake WAHA and in Chrome: the validation (more than 3, empty text, over 4000,
no opening, `nextAction` with `approachSentAt`); three texts with the chain 2, 3 and 5 days; two texts; the limit (2, 1 and 0,
for a new and for an existing lead, and 4 or -1 refused); a lead with
`approachSentAt` (first due in the past); the same call again; an existing lead given its plan, with the lookup states;
`needs_approach_sent_at`, "Não contatar", archived and replied leads; a reply cancelling the queue and the pending follow-up;
the undo; archiving cancelling the queue; six hand-made follow-ups accepted; and the limit and waits rows saving, reloading and hiding.

## Not in this task

Publishing (VET-23), the update button (VET-24) and the separate dev compose (VET-25). Nothing is sent to the pipeline's
side from here: the contract goes to the user first, and to the pipeline's agent only with their approval.
