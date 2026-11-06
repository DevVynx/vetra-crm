# VET-20 — Automations: sending the text of an activity

## Objective

Let the user send the text of an activity from Vetra with one click, and let Vetra send it by itself a few minutes after the activity is created, lead by lead, with safety rules and with everything configurable.

- **What:** a "Enviar" button on an activity that has a text, an automatic sending that Vetra does when the activity is due, and an "Automações" section in Settings where every part of it is switched on, off and tuned.
- **Why:** the pipeline now hands Vetra a lead with its first message already written as an activity. Copying it and pasting it into the conversation is the step left by hand.
- **Who benefits:** the user, who prospects in volume, and anyone who runs Vetra for their own prospecting.
- **Architectural direction:** sending reuses what already sends a text through WhatsApp. The timing is a small loop inside the API that reads the database, not an external cron and not an AI: the state lives in the database, so it survives a restart and does not send twice.

This is the first of three tasks of the automations (see "What comes next"); the publication and the update of Vetra are VET-23 and VET-24.

---

## Decisions already made with the user

- **Both ways of sending, chosen lead by lead:** one click per message, and a switch per lead for Vetra to send by itself.
- **Automatic sending happens a short time after the activity is created** (the user's idea: about two minutes), through a scheduler, whichever is simplest.
- **Every automation must be configurable and each one can be turned off.** Not everyone wants them, and not every lead goes the same way.
- **No limits.** Vetra does not cap how many messages go out, when, or how fast. The user was already warned that automations can get a WhatsApp number blocked, and the recommendation is shown, not enforced: Vetra only guarantees that the feature works.
- **A lead that asked to stop (`Não contatar`):** the manual send asks "Esta pessoa pediu para parar. Enviar mesmo assim?". The automatic send never sends to it.
- **When a lead replies, its pending follow-ups are cancelled by themselves.** (That belongs to VET-21, below.)
- The pipeline never sends anything. Vetra does, because the user asked for it here. The pipeline's own rule that its skills send nothing stays as it is.

## Proposed, pending confirmation

These are the safe defaults I suggest. Every one of them is a setting.

- **Automatic sending is off until the user turns it on** (a master switch), and a new lead starts with its own switch off.
- **Time before sending:** 2 minutes after the activity was created (or its due time, if later).
- **A failed send is not retried in a loop:** it is tried twice, and then the activity stays pending and says it failed.

## Out of scope

- Moving the stage, cancelling follow-ups on a reply and archiving who does not answer (VET-21).
- Follow-ups written by the pipeline and scheduled by Vetra (VET-22).
- Sending files, audio or images; a message is text.
- Any AI. The texts are written by the pipeline.

---

## How it works

### Settings → Automações

A new section, stored in one row (a table of its own, so Settings keeps one place for it), with:

- the master switch of the automatic sending;
- the minutes to wait before sending;
- the warning, the same as on the connection screen, that automations can get the number blocked, with the recommendation to send few and with pauses (a recommendation: Vetra enforces nothing);
- whether a new lead starts with the automatic sending on.

### Per lead

A switch **"Envio automático"** on the lead (its card and its menu), saved with the lead. The pipeline cannot set it: it is the user's decision.

### What is sent

- The text of the activity (`body`), **one WhatsApp message for each block separated by a blank line**, because that is how the pipeline writes a message in several bubbles, with a short pause between them.
- Any activity with a text, **whatever its type**. (First written as only `first_approach` and `follow_up`, which left out the activities the user types by hand, all of them `custom`; found when the button did not show on the user's own activity with a text.)
- **Never a text that still holds the marker `[SEU WHATSAPP]`** (the pipeline leaves it for the user to fill in). The manual send warns about it; the automatic send skips it and says why.

### The one-click send

A "Enviar" button on an activity that has a text, in the lead's page and in the Painel. It **always asks first** and then sends, completes the activity and says so in a toast. **A sent message cannot be unsent**, so there is no undo. The dialog names who it goes to and shows the messages as they will go. There are three, built so they cannot be mistaken for each other: a plain one; a yellow one for a text with `[SEU WHATSAPP]`; and a **red one for `Não contatar`**, with a banner, a red title and "Enviar mesmo assim" in red.

### The automatic send

A loop in the API wakes up every few seconds and looks for an activity that:

1. has a text;
2. is due (its due time, or the creation time plus the minutes to wait, whichever is later);
3. belongs to a lead with the automatic sending on, without `Não contatar`;
4. while WhatsApp is connected.

It takes the activity so that two runs cannot take the same one, sends it and completes it. The activity says when it will go ("Envio automático às 14:32") and can be cancelled (the lead's switch off) before then.

### Failure

If sending fails, the activity stays pending with the error and a count of attempts, is tried again once, and then waits for the user. WhatsApp off or a lead without a phone is not a failure: the activity simply waits.

## Requirements

- No new runtime dependency (the loop is a timer in the process).
- The send reuses the existing WhatsApp send, so the message also appears in the conversation as any other.
- **Verified with a fake WAHA and a temporary database, never with a real number.** The cases: a send, a text with several blocks, a text with the marker, a lead with `Não contatar` (automatic skips, manual asks), WhatsApp off, a failure and its retry, and two loops at once sending only once.

## Acceptance Criteria

- An activity with a text has a "Enviar" button that sends it, completes it and leaves the message in the conversation.
- With the master switch and a lead's switch on, an activity created for that lead is sent by itself after the time set, once.
- Nothing is sent by itself to a lead with `Não contatar`, to a text with `[SEU WHATSAPP]`, or while WhatsApp is off.
- Turning the master switch off stops every automatic send at once.

---

## What comes next

- **VET-21 — Stage and reply automations.** Each with its own switch: move a lead to "Abordagem enviada" when the first message goes, to "Conversando" when it replies, cancel its pending follow-ups when it replies, and archive in "Sem resposta" who does not answer after the last follow-up.
- **VET-22 — Follow-ups from the pipeline.** The pipeline is the one that has the context to write them, but it is not a server Vetra can call. So it hands the texts and the delays in advance, when it creates the lead, and Vetra schedules each next one as the previous goes out, if the lead has not replied. This needs an extension of the contract of `PUT /leads/by-slug/:slug`, agreed with the agent of the pipeline.

---

## What was done, and what was found while checking it

- **Database (migration `0023_add_automations`):** the table `automation_settings`, `leads.auto_send`, `next_actions.send_attempts / send_error / send_blocks_done / sending_since` and `completed_actions.sent_at`. It only adds, and it is **not applied** to the user's database.
- **Routes:** `GET` and `PATCH /api/automations`, `POST /api/next-actions/:id/send` and `PATCH /api/leads/:id/auto-send`. The activity answers `createdAt`, `sendAttempts` and `sendError`, and the lead `autoSend`.
- **Screens:** Settings → Automações (master switch, minutes to wait, switch for new leads, and the warning), the "Enviar" button on an activity (a lead's page and the Painel), the line "Envio automático às 14:32" or why it will not go, "Ligar/Desligar envio automático" in the lead's menu and a badge on the lead.
- **The CSV** gained `envio_automatico`, in the export and in the import (an empty cell takes the default of the settings).
- **No limits** anywhere: nothing caps quantity, hours or pace. The pause between the blocks of one text (1.5 s) is fixed, not a setting.
- **Checked** with a fake WAHA and a throwaway Postgres (never the real database or number): a one-click send of three blocks (in order, stored in the conversation as outbound, activity completed with `sent_at`); a lead with `Não contatar` and a text with the marker (409 without confirmation, sent with it); an activity with no text and one of only blank space (422); a custom activity with a text (sent, by a click and by itself); six clicks at once (one sends, five are 409); resuming after a partial send (only the blocks after the one that went); a failure (503, freed, error kept, no automatic attempt counted for a manual one) and the edit that clears it; the new-lead default from the settings (typed, pipeline, off); the automatic send with the master switch off (nothing in 20 s), on (both blocks once, a follow-up too, nothing for a lead with the sending off, `Não contatar`, a marker, a custom activity or one due in the future), a second pass (nothing again), the master switch turned off again (stops), the wait of minutes set; a failure tried twice, a minute apart, and then left for the user; an interrupted send freed and never repeated; WhatsApp off (nothing is sent, no failure, the manual one is 409) and the activity going once it is back; the CSV round trip; and, in Chrome, the settings, the status line, the menu, the send of three blocks, the two confirmations, a failure and the Painel button.
- **A lead with no conversation yet** is fine: the send opens it by the phone. A number not on WhatsApp is a 422, nothing is sent and the activity stays with the reason (by itself, one of the two attempts). Checked with the fake WAHA.
- **After the user's review:** the leads table shows a small bolt at the corner of the lead's picture when the sending is on; on a lead's page, "Não contatar" and "Envio automático" go together on a line of their own under the status; the switches in Settings have a pointer cursor. In the lists (Painel), an activity with a text has a button to copy it and one to show it under the row, so the text can be used without opening the editor.
- **Settings → Automações** shows the minutes to wait and the option for new leads only while the master switch is on; the warning about the number being blocked is always shown. The option for new leads only counts while the master switch is on.
- **Closing a lead turns "Envio automático" and "Não contatar" off** (and a customer that comes in by the import never has them on): they are marks of a lead. Checked: closing with both on and a pending activity, the import of a customer with both on, and the new-lead default with the master switch off and on.
- **With the master switch off nothing about the automatic sending is on screen:** a lead's switch in its menu, its mark on the lead's page and the bolt in the table are hidden (the "Não contatar" mark and the one-click send are not affected).
- **"Todos os leads"** in Settings (shown with the master switch on) turns the automatic sending on or off for every lead at once, with a confirmation that says how many leads that is and, to turn it on, how many texts already due would go at once. Turning it on reaches the leads in the funnel that did not ask to stop; turning it off reaches every lead that has it on. Checked: the counts (funnel only, no "Não contatar", no archived or customers; due texts only of leads with it off, without the marker, blank or future), turning on and off, turning on again (no change), a bad value (400), and, in Chrome, the row, both dialogs and the cancel.
- **A WAHA error is answered as 503** ("The WhatsApp service is unavailable"), as everywhere else in Vetra.

## Not done, on purpose

- Moving the stage, cancelling follow-ups on a reply, archiving who does not answer (VET-21) and follow-ups from the pipeline (VET-22).
- Sending anything but text, and a setting for the pause between blocks.
