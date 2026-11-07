# The demonstration environment

A separate Vetra, with its own database and a fake WhatsApp, to show the CRM with data that looks real and without touching the
real Vetra or a real WhatsApp. `pnpm demo:up` starts it at http://localhost:14720; `pnpm demo:down` removes it, volumes included.

## What it is

`demo/compose.demo.yaml` (project `vetra-demo`) runs three containers: a Postgres (port 55450, for the seed), a fake WAHA
(`demo/fake-waha.mjs`, a small Node server, port 13000 for its controls) and the published Vetra image (port 14720). Nothing is
shared with `compose.yaml` or `compose.dev.yaml`. The app takes the Host it listens on, so its port inside is the one outside too.

`pnpm demo:up` is always from scratch (`down -v` first), because the seed wipes the leads but not the WhatsApp conversations, so
an already used demo would keep what happened in it. It then:

1. starts the three containers;
2. runs the seed on the demo database (`db:seed --yes`) and names the user;
3. makes the conversations (`demo/make-chats.mjs`) from the leads and the stage each one is in, and restarts the fake WhatsApp so
   it serves them; Vetra imports them by itself (the script waits for it);
4. turns on the master switch of the automations and the reactions to a message sent and to a reply (so a lead moves by itself).

## What the seed brings

20 leads and 5 customers over the last months, with projects, installments, expenses, notes and activities. Some activities carry a
text, as the pipeline writes them (a first approach in a few bubbles, follow-ups, one with `[SEU WHATSAPP]` that is never sent by
itself), and two leads have a follow-up waiting in the pipeline's queue. Half of the conversations end with a message from the lead,
which fills "Conversas esperando você".

## A script for the presentation

1. **Leads → "Padaria Trigo de Ouro"** (stage Prospectado, first approach due today, no conversation yet): click **Enviar**. The text
   goes in its bubbles, the lead moves to "Abordagem enviada" and its follow-up becomes an activity.
2. About 25 seconds later the fake lead answers by itself: it moves to "Conversando" and the pending follow-up is cancelled.
3. To answer on demand: `POST http://127.0.0.1:13000/__incoming` with `{"phone":"<the lead's phone>","text":"..."}`; to turn the
   automatic answer off or change the wait: `POST /__autoreply` with `{"seconds":0}`.
4. Settings → Automações shows what is on; turn on the sending of a lead (its menu) to show the automatic send.

## Limits

The fake WhatsApp keeps everything in memory and answers only what Vetra uses (no media, no real events from a phone). A demo is
not a test of the WhatsApp integration: that is checked against the real WAHA.
