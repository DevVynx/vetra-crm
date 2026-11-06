# VET-21 — Stage and reply automations

## Goal

Let Vetra move a lead through the funnel by itself as the conversation goes, so the user does not have to drag
cards after every message. Each automation has its own switch and is **off by default**. Nothing here sends a
message: VET-20 sends, this task only reacts to what was sent and to what came back.

## Decisions (agreed with the user)

- **The target stage is chosen in Settings → Automações**, one selector per automation, listing the stages of the
  funnel. Stages are editable (name, color, order), so nothing is found by name or by position.
- **A reply is a message received in the lead's WhatsApp conversation** after the last message Vetra sent. It
  reuses the sync that already exists (live events and the chat list); there is no manual "replied" button.
- **"Sem resposta" is configurable:** a number of days, default 7, no upper limit (as with the other settings).
- Everything stays under the master switch of the automatic sending: with it off, none of these rows is shown
  (same rule as VET-20).

## The automations

1. **First message sent → move to a stage** (suggested "Abordagem enviada"). Runs when a text sent by Vetra
   (click or automatic) completes, only if the lead is still in the entry stage.
2. **Reply → move to a stage** (suggested "Conversando"). Runs when a received message arrives for a lead that is
   in the funnel and has not been moved there yet; never moves a lead backwards.
3. **Reply → cancel the pending follow-ups** of the lead.
4. **No reply after the last follow-up → archive in a stage** (suggested "Sem resposta") after N days.

## Plan

- Database: `automation_settings` gets, for each automation, a switch and (for 1, 2, 4) a stage id, plus the days
  of 4. One migration.
- Core (`packages/core`): the rules live in `automations` (what moves, what is never touched), called from
  `deliverNextAction` (1) and from the WhatsApp live-message save (2 and 3); the 15 s loop of VET-20 also checks 4.
  Moves go through the existing stage-saving code, so a lead that leaves the funnel keeps losing its pending
  activities exactly as before.
- Contracts/API/Web: extend the settings schema and the Automations section with the four rows.
- Docs: `AUTOMATIONS.md` and the decisions log.

## Decided while building

- **"After the last follow-up"** means: the last text Vetra sent is at least N days old, the lead has not written
  since, and it has no follow-up still pending. How many follow-ups there are and the time between them (which the
  user wants fully configurable, with a limit) belongs to VET-22; nothing here depends on it.
- **Cancelling follow-ups on a reply is on by default** (migration 0025 also turns it on for settings already saved): a follow-up landing after the lead answered looks bad. The other three start off.
- **A reply moves a lead marked "Não contatar" too:** a reply is information, not contact.
- Stage ids are not foreign keys: a deleted stage leaves the automation without a target and it waits for a new choice.
- The stage selectors list only valid targets: the middle stages for the two moves (every lead already starts at
  the entry stage, so it is not offered), the archive stages for "Sem resposta".

## What was done and checked

Migration 0024, core (`reactToSentText`, `reactToReply`, `archiveUnanswered`, `moveLeadByAutomation`,
`deleteFollowUpsOfLead`), contract, and the four rows (plus the days) in Settings → Automações. Checked end to end in a
throwaway stack with a fake WAHA and in Chrome: settings round trip and limits (days 1..3650); the first text moves a
lead only from the entry stage and only with the switch and the master switch on; a target outside the funnel is
never used; a reply moves the lead, deletes only its follow-ups, treats "Não contatar" like any lead and leaves
archived leads and customers alone; with the switches or the master switch off a reply changes nothing; a lead with
no reply is archived, but not one that replied, was texted recently, has a follow-up pending or was never written
to; and the selectors, the switch that waits for a stage, saving and reloading.

## Not in this task

- Follow-ups written by the pipeline (VET-22), publishing (VET-23) and the update button (VET-24).
