# Automations

How Vetra sends the text of an activity, by a click or by itself. Load this guide when touching the
settings of the automations, the "Envio automático" switch of a lead, or anything that sends a
message on its own. The decisions behind it are in `tasks/VET-20.md`.

## What is sent

An activity that has a `body`, **whatever its type** (the field is "Texto: a mensagem que será enviada"). The text is split at every
**blank line**, and each block goes as one WhatsApp message, in order, with a short pause between
them (the pipeline writes a message in bubbles this way). The messages are stored in the
conversation like any other, and the activity is completed with `sent_at` set.

Two things need an extra confirmation in the one-click send, and stop the automatic one for good:

- the lead asked not to be contacted (`do_not_contact`);
- the text still holds the marker `[SEU WHATSAPP]`, which the pipeline leaves for the user's own number
  and which would otherwise go to the lead as it is.

## Two ways

- **One click.** The button **always asks first** (a sent message cannot be unsent), with a dialog that
  shows who it goes to and the messages as they will go. There are three, and they must never be mistaken
  for each other: a plain one; one in yellow for a text with the marker; and one **red all over, with a
  "Não contatar" banner**, "Enviar mesmo assim" in red and the title "Esta pessoa pediu para não ser
  contatada", for a lead that asked to stop. `POST /next-actions/:id/send` with `{ confirmed }`. Without
  `confirmed`, a lead with
  `do_not_contact` or a text with the marker answers 409 and sends nothing; the screen asks the user and
  sends again with `confirmed: true`. It refuses with 409 while WhatsApp is not connected, and with 422
  for an activity with no text. A sent message cannot be unsent, so there is no undo.
- **By itself.** A loop in the API (`startAutoSend`, every 15 seconds) sends what is due. It sends nothing
  unless the master switch is on **and** the lead's own switch is on, and never to a lead with
  `do_not_contact` or a text with the marker.

## A lead with no conversation yet

The conversation is opened by the lead's phone when it is needed, so the first approach to a lead Vetra
never talked to works: if the number is on WhatsApp, the conversation is created by the send and the
message goes. If the number is **not** on WhatsApp, nothing is sent and no conversation is made: the
one-click send answers 422, and the activity stays with the reason `number_not_found` (which the screen
says as "o número não está no WhatsApp"). By itself, that counts as one of the two automatic attempts.
WhatsApp limiting messages to new contacts (`send_restricted`) is recorded the same way.

## The settings

One row in `automation_settings` (without it, the defaults apply, all off): the master switch
`autoSendEnabled`, `autoSendDelayMinutes` (2) and `newLeadsAutoSend`, which is what a lead starts with
when it is typed, imported or comes from the pipeline, **only while the master switch is on** (the screen
shows the minutes and this option only then, so the option must not keep working while it is hidden). The switch of each lead is `leads.auto_send`; only
the user changes it (`PATCH /leads/:id/auto-send`), never the pipeline. Everything is in Settings →
Automações. **There are no limits** on quantity, hours or pace: the screen only warns that automations can
get the number blocked, and the user decides.

## When something is due

An activity is due when its due time has come **and** its creation plus the minutes to wait has passed,
whichever is later. The web shows it ("Envio automático às 14:32") with the same rule, written again in
`apps/web/src/shared/utils/autoSend.ts`, since the web does not import the core.

## Why it never sends twice

The state is in the database, and an activity is **claimed** before it is sent (`sending_since`, set by an
update that finds the row free only once), so two requests, or a click and the loop, never send the same
one. Each block that goes is written down (`send_blocks_done`) before the next, so a retry continues after
it and never repeats it. Editing the text starts that count again; editing anything else only clears the
failure.

- A failure frees the activity again with why (`send_error`), and the automatic attempts count
  (`send_attempts`). It is tried again after a minute, and after **two** attempts it waits for the user.
  A manual failure only records why.
- WhatsApp off, a lead without a conversation yet, or the master switch off is not a failure: the
  activity waits. The conversation of a lead is opened by its phone when needed.
- A send that began and did not end (the server stopped in the middle of it) may or may not have gone
  out. It is **never sent again by itself**: it is freed, marked `interrupted` and left out of the
  automatic attempts, for the user to look at the conversation.

Everything is looked at again before each message of a pass, so turning the master switch off, a lead's
switch off or marking "Não contatar" stops what is still waiting.

## Everything hidden while the master switch is off

With the master switch off, nothing about the automatic sending is on screen: not a lead's switch (the item
of its menu), not its mark on the lead's page and in the table (the bolt), not the status line of an
activity, and not the rest of the settings. The one-click send and the "Não contatar" mark do not depend on
it. The web asks through `useIsAutoSendEnabled`.

## Every lead at once

In Settings, with the master switch on, "Todos os leads" turns the switch on or off for all of them
(`PATCH /automations/leads`, with the counts from `GET /automations/leads`, which the confirmation shows
first). Turning it **on** reaches the leads in the funnel (not archived, not customers) that did not ask
not to be contacted; turning it **off** reaches every lead that has it on. The confirmation to turn it on
says how many texts already due would go at once, since a lead's overdue activities are sent as soon as
its switch is on (the wait of minutes counts from when the activity was created).

## Reactions to the conversation

Four automations, each with its own switch in Settings, **off by default, except cancelling follow-ups on a reply**, and all under the master switch
(with it off they do nothing and are not shown). They never send anything: they react to what was sent and to
what came back. Each one that moves a lead has a stage chosen by the user, because stages can be renamed and
reordered; its switch only turns on once a stage is chosen. A target that was deleted, or that the move is not
allowed to reach, is skipped quietly.

- **First message sent** (`reactToSentText`, called by `deliverNextAction` once the text went): a lead still in
  the entry stage moves to the chosen funnel stage. It never throws, since the message already went.
- **Reply** (`reactToReply`, called when a message arrives live from the lead): moves the lead forward, never to an
  earlier stage and never out of the funnel, and/or deletes its pending follow-ups (`type = follow_up`, not the
  one being sent right now). A lead marked "Não contatar" is treated the same: a reply is information, not
  contact. Archived leads and customers are left alone. Messages read from the history by the sync are not
  replies.
- **No reply** (`archiveUnanswered`, one pass after each pass of the 15 s loop): archives, at the chosen archive
  stage, a lead in the funnel whose last sent text is at least N days old (default 7, no upper limit), with no
  message from it since and no follow-up still pending. Archiving drops its pending activities, as always.

How many follow-ups there are and how far apart is VET-22; until then "no follow-up pending" simply means the
last text Vetra sent was the last one.

## When a lead becomes a customer

A customer is no longer prospected, so closing a lead turns **both** "Envio automático" and "Não contatar"
off, in the same transaction that gives it its deal (its pending activities are dropped there too, as
before). A customer that comes in by the import never has either on. The marks are for leads, and the
customer screens do not show them.

## CSV

`leads.csv` has `envio_automatico` (sim/nao); an empty cell takes the `newLeadsAutoSend` of the settings.
The settings, `sent_at` and the failure fields are not exported.
