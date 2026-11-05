# VET-12 — WhatsApp integration through WAHA

## Objective

Connect one WhatsApp account to Vetra through WAHA, so conversations live next to the leads and customers they belong to.

- **What:** a QR Code connection, a status indicator always on screen, the "WhatsApp" tab with real conversations and text sending, and the links between a conversation and its lead or customer.
- **Why:** prospecting happens on WhatsApp, and today the user switches apps to know where a conversation stopped. The areas prepared in VET-7 still show "WhatsApp ainda não conectado".
- **Who benefits:** whoever prospects with Vetra, including people new to it, so the flow must stay simple and must not scare them away.
- **Problem solved:** read and answer conversations, see whose turn it is, and move a lead forward without leaving the CRM.
- **Architectural direction:** WAHA runs next to Postgres in Docker. The API is the only thing that talks to it; the web never does. Conversations are stored in Postgres, so the CRM keeps working when WAHA is off. The API opens the connection to WAHA, so nothing has to reach the API from outside.

The work is unknown territory, so it is delivered in **steps, each validated by the user before the next one starts** (see Delivery Steps).

---

## Scope

- WAHA service in `compose.yaml`, with its session persisted in a volume.
- QR Code connection, one account at a time, and disconnecting from Configurações.
- Status indicator in a bottom bar on every page.
- Import of individual conversations from the last 12 months, live updates, and catch-up after downtime.
- "WhatsApp" tab: conversation list, thread, text sending, and starting a new conversation with any number.
- Marking a conversation as read on WhatsApp when it is opened.
- Linking a conversation to a lead or customer by phone number, creating a lead from an unknown number, and changing the stage from the conversation.
- Profile photos through their URL only.
- Real data in the lead's "Conversa" card, the Painel's "Conversas esperando você" and "Último contato".
- Every "WhatsApp" button opening that person's conversation.

Out of scope:

- Viewing, playing, downloading or sending images, audio and files. Media shows only as a label, and no file is stored.
- Automations, AI, generated or scheduled follow-ups, automatic stage changes and the 14-day auto-archive. These come later.
- Any block on first contact or any enforced daily limit. Nothing is blocked; the recommendation is only informational.
- Groups, status, channels and broadcast lists.
- Selecting which contacts appear.
- Pairing code login. The connection is QR Code only.
- Several accounts at the same time.
- Showing edits and deletions made from the phone, reactions, and calls.
- Searching conversations in the Ctrl+K palette.

---

## Delivery Steps

Stop after each step for the user to validate it.

1. **Validation, with no product code.** Run WAHA with the GOWS engine and connect the user's regular account. Answer the questions in "Facts to validate" and write the findings into this file. Do not build on assumptions that failed.
2. **Connection.** Compose service, env, WAHA client, status, QR Code, disconnect, indicator, Configurações row and warning.
3. **Storage and sync.** Tables, 12-month import, live updates, catch-up, account change and photos.
4. **WhatsApp tab.** List, thread, sending, new conversation and mark as read.
5. **CRM integration and message actions.** Linking, "Tornar lead", stage control, "Último contato", lead card, Painel, buttons, avatars, the thread header actions and the message menu (see "Message actions").
6. **Documentation.** Decisions log and guides (see Technical Notes).

### Results of step 1

Validated on WAHA 2026.10.1 with GOWS, on the free image, with the user's regular account:

- **Connection:** QR Code reaches `WORKING`, and a container restart returns to `WORKING` with no new scan. `PASSKEY_REQUIRED` didn't appear. Logging out returns the session to `SCAN_QR_CODE`, so disconnecting also has to stop it.
- **Events:** the API-side WebSocket (`/ws`) works and reconnects after a restart. `message.any` covers messages sent from the phone and received ones.
- **History:** `FULL_SYNC_DAYS_LIMIT=365` isn't a strict cut, because older messages still arrived. The import must filter by date, and `filter.timestamp.gte` works.
- **History coverage:** the user compared the imported list with the phone on the real screen and no conversation seemed to be missing, so `WAHA_GOWS_DEVICE_REQUIRE_FULL_SYNC=true` wasn't needed.
- **Pagination:** a single chat can have thousands of messages, so the import must page with no per-chat cap.
- **Identity:** live events use `@lid` in `from` and in `Info.Chat`, with the phone in `Info.SenderAlt` or `Info.RecipientAlt`, while `/chats` lists the same person as `@c.us`. Messages must never be attributed through `from` alone, and `@lid` and `@c.us` must resolve to one conversation. No chat appeared as `@lid` in `/chats`.
- **Ninth digit:** most Brazilian ids come without it, so the canonical phone is required.
- **Unread:** WAHA exposes no unread count, so Vetra has to compute it. Reading a conversation on the phone sends a `message.ack` with `READ`, confirmed on a conversation left unopened until then.
- **Photos:** `/chats/overview` already returns `picture` as an `https` URL, with no call per contact. The URL lasted about 10 days in the sample, so refreshing once a day is enough.
- **Media:** with downloads off, `media.mimetype` stays available and `media.url` doesn't come. No media file was kept in the container. WAHA does keep its own copy of the messages in the session volume.
- **Usage:** about 400 to 750 MB of RAM and almost no CPU when idle, below the documented recommendation.

Not tested with a real account, and verified from step 4 on: sending, `check-exists`, marking as read, and messages received while WAHA is off.

Test messages only go to a recipient the user chooses. Real conversation content must not be copied into this file, logs or commits.

### WhatsApp Business

Working with both regular and Business accounts is a **mandatory requirement**. WAHA's documentation does not mention Business, and no Business number is available now. Step 1 validates the regular account only. The Business check stays **open**, and VET-12 is not fully accepted until it runs.

---

## Functional Overview

### Connection

- One account at a time, by QR Code. Disconnected, the "WhatsApp" tab is the connection screen; connected, it shows the conversations.
- The QR Code refreshes by itself as WAHA issues new ones, and connecting moves the screen forward with no action needed.
- Disconnecting lives in Configurações and asks for confirmation. The dialog shows a spinner while it runs, closes on success and stays open on failure. Conversations stay stored and become read-only: sending is disabled, with a link to connect.
- Connecting the same number again catches up, with no deletion.

### Connecting a different number

Vetra stores the connected number. If the scanned number differs and conversations exist, it shows a confirmation before importing anything:

- **Apagar e importar:** deletes the old conversations and imports the new account.
- **Cancelar:** disconnects the new number and keeps the old conversations.

The deletion is permanent, so the dialog says so. Two accounts are never mixed. `Esc` does nothing in this dialog, so the choice only happens through its buttons.

### Deleting the conversations

Configurações has an "Apagar conversas" action, with confirmation, shown only while conversations exist. It is available only while disconnected, because the next sync would import everything again otherwise. It deletes the conversations, the messages and the stored account, so the next connection is a first import for any number. Nothing changes on the phone.

### Warning on the connection screen

Shown as plain informative text, in muted style, never in red, and never blocking anything:

> **Antes de conectar**
> Esta conexão não é oficial do WhatsApp, então existe algum risco de bloqueio do número. Em um número que já está em uso, recomendamos até 20 abordagens e 10 follow-ups por dia. Em um número novo, espere alguns meses antes de começar e evite automatizar. Mesmo seguindo essas recomendações, não conseguimos garantir que o número não será bloqueado e não nos responsabilizamos caso isso aconteça.

### What is imported

- Only individual conversations. `@g.us`, `@newsletter`, `status@broadcast` and broadcast lists are ignored in the import, in live events and in catch-up.
- Messages from the last 12 months at the time of the import. Nothing is pruned afterwards.
- The import runs in the background and the tab says it is running, while the list fills up. The app stays usable.
- WAHA keeps receiving history for a while after pairing, so the import repeats every minute until new messages stop arriving, instead of running once.
- Empty messages with no text and no media, such as system notices, are not stored.
- WAHA exposes no unread state for old messages, so history starts as read and only messages arriving from then on count as unread.
- Importing is idempotent. Repeating it, or receiving a message through both import and live event, never duplicates it.

### Staying up to date

- The API listens to `message.any` and `session.status` over WebSocket and reconnects with backoff.
- WebSocket events aren't replayed, so on API start and on every reconnection the API catches up by reading messages newer than the last stored one.
- The API tells the web that something changed through SSE (`GET /whatsapp/events`). The event carries only a signal, never text, names or numbers, and the web then refetches with its normal queries.
- The browser only retries SSE after a dropped connection and gives up for good after an error response, so the web reconnects by itself in that case, and refetches whenever the connection returns. The list and open thread also refetch every 30 seconds as a safety net. The status badge keeps polling every 5 seconds.

### Conversation and lead

- A conversation links to a lead or customer only when the phone number matches. There is no other inference: no number match means no link.
- **A WhatsApp contact is not assumed to be a lead.** The account may hold family, friends and other personal contacts. They stay as plain conversations, and no lead is ever created automatically.
- **A phone number is unique across leads and customers**, so a conversation links to at most one person. A customer is a lead with a deal, so the link is the same.
- Matching uses a canonical phone: the full international number in digits, treating Brazilian mobile numbers with and without the ninth digit as equal. Nothing is assumed about the country at this level, since WhatsApp ids already carry it. The rule lives in `domain.ts`.
- One number is one conversation: live events and the sync look for the same id or the same canonical phone, so a chat arriving under the other form of a Brazilian number joins the conversation that already exists. The agenda is matched by canonical phone too.
- Numbers from any country are supported. Forms assume Brazil unless the number starts with +, and the screen always shows the ninth digit on Brazilian mobile numbers, since WhatsApp ids only carry it in some regions.
- The link isn't stored: it is read by comparing the `phoneKey` of the lead and of the conversation, so it can't go stale when a lead is created, gets another phone or is deleted. Only the unique index on `leads.phoneKey` has to hold, and `whatsapp_conversations.lead_id` was dropped.
- Deleting a lead keeps the conversation, which becomes an unknown number.
- An `@lid` contact with no resolvable phone appears by name, can receive messages, and doesn't link automatically.
- The shown name is the lead or customer's contact name when linked, or the business name when the contact is empty, then the name saved in the user's agenda, then the formatted number. There is no separate name field for a conversation: filling the contact means talking to that person, and leaving it empty means talking to the company. The other name shows below it, or the number when there is none.
- Someone who is neither a lead nor in the agenda stays as a number. To give them a name, save them on the phone or use "Tornar lead". The name a person gave their own profile isn't shown or searched, since the user only trusts names they chose. It is only used for a hidden `@lid` contact with no number. The agenda comes from WAHA's contacts list, read on every sync; a contact saved on the phone shows up on the next one.

### Sending

- Text only, trimmed, not empty, at most 4,096 characters. Sending is allowed in any conversation and to any number, including first contact.
- A new number goes through `check-exists` first, and the `chatId` it returns is used. A number not on WhatsApp shows an error and creates nothing.
- A sent message can't be recalled, so it has no "Desfazer" toast.
- WhatsApp restrictions (`463` and `475`, limits on new contacts) become a clear message in Portuguese saying to wait. They never restart or log out the session, as WAHA's guide warns.

### Message actions

Delivered in step 5, working like WhatsApp Web.

**Thread header**

- The actions next to the name depend on the contact: **Tornar lead** for an unknown number, the stage badge and **Ver lead** for a lead, and only **Ver cliente** for a customer.
- A three dots button at the far right opens a dropdown with only the essentials: for now, **Fechar conversa**, which returns to the empty state.

**Menu on each message**

- Hovering a message shows a down arrow. Clicking it opens a dropdown with **Responder**, **Copiar**, **Editar**, **Selecionar** and **Apagar para todos**. A received message only has Responder and Copiar, since WhatsApp doesn't let anyone edit or delete someone else's message for everyone. Everything but Copiar is off while disconnected.
- **Editar** was added at the user's request, for the user's own text messages. **Encaminhar** was left out: it needs a screen to choose the chat, and nobody asked for it again.
- **Selecting messages:** select one or more messages to delete them.

**Storage for the actions**

- `whatsapp_messages` gained `waha_id` (WAHA's calls need the full id), `reply_to_external_id`, `reply_to_content`, `edited_at` and `deleted_at`. Messages imported before this have no `waha_id`, so the full id is rebuilt as `<fromMe>_<chatId>_<id>`.
- Deleting drops the text and the quote from the database, like WhatsApp does, and the bubble reads "Mensagem apagada". Messages already stored have no quote, since the import only brings it for new ones.
- `message.edited` and `message.revoked` events update edits and deletions made by the other person, or from the phone. Their payload comes from WAHA's docs and is not verified with a real account: if it differs, the event is ignored and nothing breaks.

**Replies**

- A message that answers another one shows the quoted message above its text, in received and sent messages alike.
- **Responder** shows the quoted message above the text box, with a way to cancel, and sends through `reply_to`.

What WAHA's docs say, not yet verified with a real account:

- **Reply:** `POST /api/sendText` accepts `reply_to` with the message id. Received messages bring `replyTo` with `id`, `participant`, `body`, `hasMedia` and `media`; `id` and `participant` may be absent depending on the engine, and no GOWS note exists, so the quote must work from `body` alone.
- **Delete:** `DELETE /api/{session}/chats/{chatId}/messages/{messageId}`, listed for GOWS. The docs don't say whether it deletes for everyone or only for you, or any time limit. This needs a real test by the user before "Apagar" is promised.
- **Forward:** `POST /api/forwardMessage` with `chatId`, `messageId` and `session`, only to chats you talked to before, otherwise it may fail. It is small to add, but needs a screen to choose the chat.
- **Message id:** these calls need the id in WAHA's format, while `whatsapp_messages.external_id` keeps only its last part, so the format must be checked or the full id stored.
- **Deleted by the other person:** `message.revoked` brings `before` and `after`, in case showing it enters the scope later.

  Decided with the user:

- **Apagar** deletes for everyone on WhatsApp. The docs don't state the scope or a time limit, so the behavior is confirmed by the user on a conversation of their own.
- The action for an unknown number is called **Tornar lead**.
- The header changes with the contact: a lead can change stage, a customer can't.
- Migrations of this step may be applied to the real database. Tests still never use the real account or database.

To confirm with the user when step 5 starts:

- Whether reply data has to be imported again for messages already stored, since `replyTo` isn't kept today.

### Read ticks

Sent messages show one gray tick when sent, two when delivered and two blue when read, from WAHA's `message.ack`. The first import brings them along with each message. Messages imported before this existed stay without ticks, which the user accepted since it only affects the development data. A status never moves backward. If the person turned read receipts off, the `READ` ack never comes, so it stays at two gray ticks, exactly like on WhatsApp.

### Mark as read

Opening a conversation marks it as read in Vetra and on WhatsApp, only while the window is in focus. A failure on WAHA's side doesn't get in the way of reading it, and catch-up reconciles the count.

### Stage from the conversation

- The thread header shows only the current stage as a badge. Clicking opens the stage menu.
- Choosing Fechado opens `CloseLeadSheet`. Archiving opens the existing archive dialog. Other stages apply directly with the usual "Desfazer" toast. All the rules of VET-9 still apply.
- A linked lead has the stage badge and "Ver lead"; a customer has only "Ver cliente", with no stage control.
- An unknown number has "Tornar lead", which opens the lead form with the number filled in and the WhatsApp profile name as an editable suggestion in the contact field.

### Último contato

The only automatic effect on a lead: any message, sent or received, moves `lastContactAt` forward, never backward, including during the import. It never changes the stage or `stageChangedAt`.

### Profile photos

- Only the URL is stored, never a file. No image is downloaded by the API.
- It is refreshed at most once a day per contact, with no use of `refresh=True` in bulk.
- Only `https` URLs are accepted. A missing, hidden or expired photo falls back to the initials.
- It appears in the conversations and in the lists and details of leads and customers that have a conversation.

---

## UI Elements

**Status bar (app shell)**

- A thin bar of about 28px below the main panel, on every page, with the status at its right corner: WhatsApp icon plus "WhatsApp conectado" (`success`) or "WhatsApp desconectado" (`destructive`).
- Anything other than connected is red, including waiting for the QR Code, failure and WAHA off.
- Clicking leads to `/whatsapp`. Works at phone width without horizontal scroll.

**Configurações**

- A "WhatsApp" section using `SettingsSection` and `SettingsRow`: status, connected number, "Conectar" (goes to `/whatsapp`) or "Desconectar".

**WhatsApp tab, disconnected and with no conversations**

- One card, like WhatsApp Web's own linking screen: numbered steps beside the QR Code, and the warning in the card's footer. The terms follow WhatsApp's official help ("Mais opções", "Configurações", "Dispositivos conectados", "Conectar dispositivo").
- A short line says the WhatsApp can be disconnected at any time, with a link to Configurações.
- The QR Code's space keeps its size in every state. If WAHA is off, it shows a message saying the service isn't running, with no raw error.

**WhatsApp tab, with conversations**

- Two panes: conversation list and thread. At phone width, one pane at a time.
- If disconnected, a discreet notice with "Conectar" above the panes.
- **List:** search by name or number, "Nova conversa" button, items with avatar, name, last message preview, relative time and unread count, newest first. 30 per page, loading more on scroll.
- **Thread:** header with avatar, name, number and the stage control; messages grouped by day; the latest 50, loading older ones on scroll up; a text box with `Enter` to send and `Shift+Enter` for a new line.
- **Composer:** focused when a conversation opens, except on touch screens, where the keyboard would cover the messages. It stays read-only while sending, keeping the focus, so nothing typed meanwhile looks like part of what was sent.
- **Bubbles:** the time and the ticks sit inside the bubble, at its bottom right corner, WhatsApp style.
- **No conversation open:** a small illustration made of message bubbles, a short explanation and "Nova conversa" while connected.
- **Media messages:** a label with its icon ("Imagem", "Áudio", "Vídeo", "Documento", "Mídia") plus the caption when there is one.
- **Nova conversa:** a dialog with the number, which opens the existing conversation if there is one, or an empty thread otherwise.
- **States:** loading, empty list, no search results, import in progress, send error. Errors go through `getErrorMessage`.

**Lead detail, "Conversa" card**

- Real data with the existing state and bubbles, and "Abrir conversa".
- No conversation: "Nenhuma conversa ainda" with "Enviar mensagem".
- Never connected: "WhatsApp não conectado" with "Conectar".

**Painel, "Conversas esperando você"**

- Conversations of leads and customers whose last message was received, newest first, each opening its own thread. Family and friends stay in the WhatsApp tab: they aren't work waiting on the user.
- Connected with nothing waiting: "Nenhuma conversa esperando você". Never connected: "WhatsApp não conectado".

**WhatsApp buttons**

- `WhatsAppButton` (lead and customer) and the button in `NextActionItem` open that person's conversation through `/whatsapp?leadId=<id>`. With no conversation yet, they open an empty thread for the lead's number.
- The customer page has no "Conversa" card.

---

## Requirements

- The API and every non-WhatsApp screen must work normally with WAHA off or the session down. WAHA failing at startup must not stop the API.
- Everything from WAHA is external input, validated with Zod before being used. Payloads differ between engines, so only GOWS is supported and the engine is fixed in the configuration.
- Message content, phone numbers, the API key and the WebSocket URL (it carries the key) must never appear in logs or error messages.
- Lists must not issue one query per conversation, and adding `photoUrl` to the lead lists must not slow them noticeably.
- Stage changes reuse the same services and dialogs as the lead page. No second implementation.
- Importing a large account must not block API responses.
- The API now holds private conversations and can send messages, so it rejects foreign `Host` headers and, on any request with effects, foreign `Origin` headers.
- WAHA's `FAILED` covers an expired QR Code and a device removed on the phone, among others, so the screen treats them all as the default disconnected state. Connecting from it logs out first, since a restart doesn't recover lost authorization.

---

## Backend Requirements

### Infrastructure

- `compose.yaml`: a `waha` service with a pinned image tag, published as `127.0.0.1:3001:3000` (the web already uses 3000, and it must never be `0.0.0.0`), with a volume for `/app/.sessions`, `WHATSAPP_DEFAULT_ENGINE=GOWS`, the history limit and media downloads off.
- WAHA's dashboard and Swagger stay disabled, since Vetra is the only interface.
- New env vars in `.env.example` and `packages/config/env/src/waha.ts`: `WAHA_URL` and `WAHA_API_KEY`. Only the API checks them at boot, so database commands don't need them. No secret is hardcoded, and none has a `VITE_` prefix.
- Failures talking to WAHA are logged once per change, with no paths, numbers or keys.
- The session volume is equivalent to account access. It must stay out of git.

### Database

`leads`:

- Gains `phoneKey` (canonical phone) with a unique index. Creating, editing or restoring a lead or customer with a number already in use returns a `409` (`LeadPhoneAlreadyExistsError`), shown in Portuguese.

`whatsapp_accounts` (a single row):

- `id`, `phone`, `connectedAt`, `historyImportedAt` (nullable, empty until the first import settles), `createdAt`, `updatedAt`

`whatsapp_conversations`:

- `id`, `chatId` (unique), `phone` (nullable, for an unresolved `@lid`), `phoneKey` (canonical, nullable, indexed)
- `leadId` (nullable, `onDelete: "set null"`, indexed)
- `contactName` (nullable), `photoUrl` (nullable), `photoFetchedAt` (nullable)
- `unreadCount`, `lastMessageAt` (nullable, indexed). The preview and direction of the last message are read from the message itself, not stored twice.
- `createdAt`, `updatedAt`

`whatsapp_messages`:

- `id`, `conversationId` (`onDelete: "cascade"`), `externalId`, `direction`, `type`, `content` (nullable), `sentAt`, `createdAt`
- Unique (`conversationId`, `externalId`), index (`conversationId`, `sentAt`)

All dates are `timestamptz`, following `DATABASE.md`. Deletes are hard deletes. Add a named migration.

`whatsappMessageTypeSchema` gains `video` and `other`.

### API

New routes in `packages/routes` (`whatsappRoutes`) and contracts in `packages/contracts/src/whatsapp`:

- `GET /whatsapp/status`: `connected | disconnected | connecting | awaiting_qr | unavailable`, the number, whether an import is running, and a pending account change.
- `GET /whatsapp/events`: SSE stream of change signals.
- `GET /whatsapp/conversations/count`: how many conversations are stored.
- `DELETE /whatsapp/conversations`: deletes the conversations, the messages and the account. Returns `409` while connected and `503` if WAHA can't confirm the connection state.
- `POST /whatsapp/connect`: starts the session (idempotent).
- `GET /whatsapp/qr`: the QR Code proxied by the API.
- `POST /whatsapp/disconnect`
- `POST /whatsapp/account-change`: `replace` or `cancel`, when the number differs.
- `GET /whatsapp/conversations`: `q` and page, lightweight items.
- `POST /whatsapp/conversations`: opens or creates one from a number.
- `GET /whatsapp/conversations/:id`: one conversation, including one with no messages yet.
- `GET /whatsapp/conversations/:id/messages`: newest first, each page continuing from the `before` message.
- `POST /whatsapp/conversations/:id/messages`: sends text.
- `POST /whatsapp/conversations/:id/read`
- `GET /whatsapp/conversations/awaiting`: for the Painel, declared before `/:id`.
- `GET /leads/:id/conversation`: for the card and the buttons.

Lead and customer list and detail responses gain `photoUrl` (nullable).

New domain errors in the registry:

- `WhatsappNotConnectedError` (`409`)
- `WhatsappNotAwaitingQrError` (`409`)
- `WhatsappNoAccountChangeError` (`409`)
- `WhatsappStillConnectedError` (`409`)
- `WhatsappUnavailableError` (`503`, under a new `ServiceUnavailableError` category)
- `WhatsappNumberNotFoundError` (`422`)
- `WhatsappSendRestrictedError` (`429`)

### Layers

- `packages/infra/src/waha/`: the WAHA client, one plain function per endpoint, with responses parsed by Zod and no business rules.
- `packages/core/src/features/whatsapp/`: `domain.ts` (canonical phone, individual-chat filter, message type, shown name), repositories and services, with the `whatsappRepositories` and `whatsappServices` barrels.
- `apps/api/src/features/whatsapp/`: HTTP-only controllers, and the WebSocket listener started with the server.
- Leads' create, edit and restore services trigger the relink through a core service, and the controller knows nothing about it.

---

## Frontend Requirements

- `features/whatsapp`: `queries`, `mutations`, connection screen, list, thread, composer, new conversation dialog, stage control.
- `shared/whatsapp`: the status query and `WhatsAppStatusBar`, mounted once in `routes/_app.tsx` below `SidebarInset`. `useTablePageSize` already adapts the tables to the lost height.
- `routes/_app/whatsapp.tsx` replaces `PagePlaceholder`, with a validated search param for `leadId` and the selected conversation.
- `useLeadConversation` and `useAwaitingConversations` drop `NOT_CONNECTED` and call the API.
- `MessageBubble` stops clamping text in the thread, keeping the clamp only in the lead's card.
- `WhatsAppButton` receives the lead id. `BusinessAvatar` already has `photoUrl`, and the image uses `referrerPolicy="no-referrer"`.
- Green and red come only from the `success` and `destructive` tokens (`DESIGN-TOKENS.md`).
- All text is Portuguese and hardcoded.

---

## Technical Notes

- No factories, no closures returning functions, no classes except errors. One file per query or action.
- Prefer Node's built-in `WebSocket` over a new dependency, if the runtime has it.
- The API stays on `127.0.0.1`, and CORS doesn't change.
- WAHA recommends 2 CPUs and 4 GB of RAM even for one session. Record the real usage from step 1 in the docs.
- Step 6 updates `PROJECT-OVERVIEW.md` (the WhatsApp scope and the decisions log, replacing "first cold approach stays manual" and "stays out of the first backend"), the `packages/infra` line in `AGENTS.md`, `ENV-CONFIG.md`, `ERROR-HANDLING.md` (the new `ServiceUnavailableError` category), `DATABASE.md` if needed, and the setup instructions.
- `pnpm db:seed` doesn't create conversations. The real account's data must never be used as test fixtures.
- All imported message text is kept in Postgres, including personal conversations. It feeds the lead's card and works with WAHA off, and a future AI can read the context from the database. Which conversations that AI may read is decided when it is built; the suggestion so far is only those of leads and customers.
- The user decided to keep Postgres published as it is in `compose.yaml` (`5432:5432`).

---

## Testing Requirements

No automated tests, as in VET-9, VET-10 and VET-11. Each step is verified over HTTP and in the browser, against a temporary database for anything that writes:

- Failure paths with a fake WAHA: off, slow, malformed payload, `463` and `475`, WebSocket drop followed by catch-up.
- Canonical phone cases: with and without the ninth digit, with and without 55, landline, `@lid`.
- Duplicate delivery of the same message, and repeating the import.
- Real-account checks only with the user present, and sending only to the recipient the user chooses.

---

## Acceptance Criteria

- A regular account connects by QR Code, survives a restart with no new scan, and disconnects from Configurações.
- **A Business account does the same (open until a Business number is available).**
- The bar shows green only when connected and red in every other case, including WAHA off, and clicking it opens `/whatsapp`.
- The warning text appears on the connection screen and blocks nothing.
- Only individual conversations from the last 12 months appear, with no duplicates after repeating the import.
- Messages sent from the phone or received while the API was off appear after catch-up.
- Text can be sent in an existing conversation and to a new number, and a number not on WhatsApp shows a clear error.
- Opening a conversation marks it as read on WhatsApp.
- Media appears as a label, and no media file is stored by Vetra or kept by WAHA.
- Conversations link automatically to leads and customers only by phone number, including numbers without the ninth digit. Editing a phone relinks, and deleting a lead keeps the conversation.
- Contacts that match no number stay as plain conversations, and no lead is created automatically.
- A number already used by a lead or customer can't be used again, and the screen explains why.
- "Tornar lead" opens the form filled in. The stage changes from the thread, with Fechado and archive using their existing flows.
- "Último contato" follows the messages and never moves backward. No stage changes automatically.
- Photos appear from their URL only, and fall back to initials when missing or expired.
- The lead's card, the Painel and every WhatsApp button use real data and open the right conversation.
- With WAHA off, the API starts, and every other screen works.
- Connecting a different number requires confirmation, and accounts never mix.
- WAHA only listens on `127.0.0.1`, and neither the API key nor message content appears in logs.
- `pnpm format`, `pnpm check-types`, `pnpm lint` and `pnpm build` pass, with no console errors.

---

## Project References

The executing agent must read these before starting:

- `docs/guides/ADDING-A-FEATURE.md`, `API-OVERVIEW.md`, `API-MODULES.md`, `API-VALIDATION.md`, `SHARED-CONTRACTS.md`
- `docs/guides/DOMAIN-MODELING.md`, `ERROR-HANDLING.md`, `DATABASE.md`, `ENV-CONFIG.md`
- `docs/guides/WEB-VITE-OVERVIEW.md`, `WEB-VITE-DATA-LAYER.md`, `WEB-COMPONENTS.md`, `DESIGN-TOKENS.md`
- `tasks/VET-7.md`, for the conversation card and the message contract
- WAHA docs: [Sessions](https://waha.devlike.pro/docs/how-to/sessions/), [Events](https://waha.devlike.pro/docs/how-to/events/), [Chats](https://waha.devlike.pro/docs/how-to/chats/), [Contacts](https://waha.devlike.pro/docs/how-to/contacts/), [Receive messages](https://waha.devlike.pro/docs/how-to/receive-messages/), [Send messages](https://waha.devlike.pro/docs/how-to/send-messages/), [GOWS](https://waha.devlike.pro/docs/engines/gows/), [Security](https://waha.devlike.pro/docs/how-to/security/), [Avoid blocking](https://waha.devlike.pro/docs/overview/how-to-avoid-blocking/)

Project-specific decisions that apply to this issue:

- Single `Lead` entity: a customer is a lead plus a `deals` row.
- Hard delete everywhere.
- The API stays on `127.0.0.1`, with no authentication, and CORS only allows the web app.
- UI text is Portuguese, hardcoded.
- Dates are stored as UTC instants and shown through the profile's time zone (`shared/time-zone`).
- Env comes only from `process.env`, through `packages/config/env`.
