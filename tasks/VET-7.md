# VET-7 — WhatsApp conversation card on the lead detail page

## Objective

Show the latest WhatsApp messages of a lead directly on the lead detail page, together with whose turn it is to reply, and reflect that state in the status line under the contact name.

- **What:** a "Conversa" card on the lead detail page (last messages, conversation state, link to the WhatsApp page), plus the conversation state in the header status line.
- **Why:** the most useful question on a lead is "who owes the next move?". Today the page shows only the time in the stage and a last-contact date, with no sign of what was actually said or who replied last.
- **Who benefits:** the CRM user, who stops switching to the WhatsApp tab to remember where a conversation stopped.
- **Direction:** front-end only, backed by the mock layer. The message contract and endpoint are defined now so the future WhatsApp (WAHA) integration only has to implement it.

---

## Scope

- Message and lead-conversation contracts in `packages/contracts` (`whatsapp/`).
- A mock endpoint `GET /leads/:leadId/conversation` returning the lead's conversation with its messages.
- A "Conversa" card on the lead detail page, below "Atividades" in the right column.
- Conversation state ("waiting for you" / "waiting for the lead") computed from the last message.
- Header status line (`DetailIdentity` status) shows the conversation state when a conversation exists.
- Mock messages for the sample leads, coherent with the lead's stage and with `lastContactAt`.

Out of scope: the WhatsApp page itself, opening a specific conversation from the lead (the button goes to `/whatsapp`), sending messages, message templates, AI summaries, real WAHA integration, API and database, and the customer detail page.

---

## Functional Overview

### Conversation card

- Shows the **4 most recent messages**, oldest at the top, as compact chat bubbles: messages received from the lead on one side, messages sent by the user on the other, each with the time (and the day when it is not today).
- Long text is cut at 2 lines.
- Messages that are not text (audio, image, document) are shown as a label ("Áudio", "Imagem", "Documento") instead of content.
- The card header shows the **conversation state** and the number of unread messages when it is greater than zero.
- The card header has an **"Abrir conversa"** button that navigates to `/whatsapp`.

### Conversation state

Computed from the last message, never persisted:

- Last message received from the lead: "Aguardando você responder há X".
- Last message sent by the user: "Aguardando resposta do lead há X".
- `X` uses the existing relative-time formatting (`formatLastContact`).

### Header status line

- With a conversation: the "Último contato …" part is replaced by the conversation state, e.g. "Conversando há 1 semana · Lead respondeu há 2 dias" or "Reunião há 5 dias · Você respondeu há 1 dia".
- Without a conversation: unchanged ("Sem contato ainda" or the current last-contact text).
- `lastContactAt` of the mock becomes the time of the last message, so the two pieces of information can never contradict each other.

### Leads without a conversation

- Shown for every stage, archived leads included.
- Empty state: "Nenhuma conversa ainda" with an **"Abrir WhatsApp"** button to `/whatsapp`. This is the case for leads in Prospectado and Demo publicado, which have not been contacted yet.

---

## UI Elements

**Lead detail page, right column** (order: stepper, Atividades, Conversa)

- Section "Conversa" with icon, unread count badge and state text
- "Abrir conversa" button in the section header

**Message bubble**

- Direction (received / sent), content or non-text label, time
- Two-line clamp for long text

**Empty state**

- "Nenhuma conversa ainda" and "Abrir WhatsApp" button

**Header status line**

- Stage and time in the stage, then the conversation state (or last contact when there is no conversation)

---

## Requirements

- The card, the bubbles and the state text live in the leads feature; the message contract lives with the other WhatsApp contracts.
- Reuse `Section`, `SectionEmpty`, `SectionSkeleton` and the date helpers; do not add parallel components for the same purpose.
- The conversation state is derived by a single helper used by both the card and the header, so they always agree.
- Loading, error and empty states are covered.
- UI text is Portuguese and hardcoded, like the rest of the app.
- The mock conversations are deterministic (no `Math.random`), and consistent with the lead's stage: no conversation before first contact, and `lastContactAt` equal to the last message.
- The "Aguardando conversas" list of the Painel and this card must not disagree for the same lead; derive both from the same mock data when possible.

---

## Backend Requirements

### Contracts

In `packages/contracts/src/whatsapp/`:

- `whatsappMessageSchema`: `id`, `direction` (`inbound` | `outbound`), `type` (`text` | `audio` | `image` | `document`), `content` (`string | null`, null for non-text), `sentAt` (ISO datetime).
- `leadConversationSchema`: `id`, `unreadCount`, `messages` (the latest messages, newest last).
- `getLeadConversationResponseSchema`: `{ conversation: leadConversation | null }` (GET, response only, per `SHARED-CONTRACTS.md`).
- Re-export through the feature `index.ts`.

### API

Mock only for now, mirroring the future endpoint:

- `GET /leads/:leadId/conversation` returns the conversation or `null` when the lead has none, limited to the 4 latest messages.

There is no real API or database in this issue.

---

## Frontend Requirements

- A query hook in `features/leads/queries` for the conversation, with a key in the leads query keys, following the data-layer conventions.
- `LeadConversation` card component and a small message-bubble component.
- Navigation to `/whatsapp` through the existing `Link` pattern (as in `WhatsAppButton`).
- The status line in `LeadDetailPage` uses the shared state helper.
- Respect the dark theme, the semibold-on-important-buttons rule, and the project's spacing and token conventions.

---

## Technical Notes

- The conversation state is computed, not stored.
- Keep the message shape storage-agnostic so the WAHA integration can map onto it.
- No new libraries.
- Keep names consistent with the existing WhatsApp contracts (`conversationSummarySchema`).

---

## Testing Requirements

The project has no automated tests yet; cover the logic that is easy to get wrong with unit tests if a test setup exists by then, otherwise verify manually in the browser:

- State derivation: last message inbound, last message outbound, no messages.
- Relative-time text for the state.
- Non-text messages render the label, long text is clamped.
- Leads before first contact show the empty state, and the header shows no conversation state.

---

## Acceptance Criteria

- The lead detail page shows the "Conversa" card below "Atividades" for every lead, including archived ones.
- With a conversation, the card shows up to 4 messages, oldest first, with direction, time and the non-text labels.
- The card header shows "Aguardando você responder há X" or "Aguardando resposta do lead há X" correctly from the last message, and the unread count when above zero.
- The header status line shows the same state instead of the "Último contato" text; without a conversation it is unchanged.
- Leads in Prospectado and Demo publicado show the empty state and "Abrir WhatsApp".
- "Abrir conversa" and "Abrir WhatsApp" navigate to `/whatsapp`.
- For every sample lead, `lastContactAt` equals the last message time, and the stage time is never later than the last contact.
- The contract follows `SHARED-CONTRACTS.md` (response only for the GET, endpoint-named).
- `pnpm format`, `pnpm check-types` and `pnpm build` pass, and the page has no console errors in light and dark themes.

---

## Project References

The executing agent must read these before starting:

- `docs/project/PROJECT-OVERVIEW.md`
- `docs/guides/SHARED-CONTRACTS.md`
- `docs/guides/WEB-COMPONENTS.md`
- `docs/guides/WEB-VITE-OVERVIEW.md`
- `docs/guides/WEB-VITE-DATA-LAYER.md`
- `docs/guides/DESIGN-TOKENS.md`

Project-specific decisions that apply to this issue:

- Front-end only, with the mock layer in `apps/web/src/shared/mocks`; no API, database or WAHA calls.
- The WhatsApp page does not exist yet; links go to `/whatsapp` without a lead identifier.
- No audit log or edit history: it was considered and dropped because the CRM has a single user for now.
