# VET-13 — Media in WhatsApp conversations

## Objective

Show what people send besides text: images, videos and documents that open from the thread, and voice messages that play.

- **What:** media messages stop being a bare label. Images, videos and documents open from the thread, and audio plays in it.
- **Why:** prospects send photos, logos, documents and voice messages, and today the thread only says "Imagem" or "Áudio".
- **Who benefits:** the user, who stops opening the phone to see what a lead sent.
- **Architectural direction:** the files are **never stored by Vetra**. The API asks WAHA for a file only when the user opens it, and passes it on to the browser. The web never talks to WAHA.

Delivered in **steps, each validated by the user before the next one starts**, like VET-12.

---

## Decisions already made with the user

- **Download on demand, nothing kept by Vetra.** No file, no thumbnail and no base64 in Postgres. It follows the earlier rule of not storing images (VET-12 profile photos).
- **Receive and see only.** Sending media is out of scope here.
- **View-once messages were dropped** (see "What was found about view-once").
- Tests never use the real account or database. Anything that needs a real file is checked by the user, in a conversation they choose.

## Out of scope

- View-once messages.
- Sending media, stickers, GIFs, contacts, locations, polls and reactions.
- Keeping a local copy, thumbnails and previews that need a stored file.
- Transcribing audio.
- Downloading media in bulk, or on import.

---

## What was found about view-once

Looked at with the user's account, reading only the shape of messages, never their content:

- The photo and audio the user sent and received as view-once **never reached WAHA** as messages, neither in the history nor in the live events. What arrived was an ordinary photo (`viewOnce: false`) and an ordinary voice message.
- The field does exist: a sticker that replied to a view-once photo carried the quoted image with `viewOnce: true`. So it only shows up inside a reply.
- The likely cause is that WhatsApp doesn't deliver view-once messages to linked devices. That is why the feature was dropped.

A sticker is told by its own message kind (`stickerMessage`, `Info.MediaType` of `user_created_sticker`), not by its `image/webp` file, which some photos share. It has a type of its own, `sticker`, shown as "Figurinha" and opened like an image. Stickers stored before that were images; a repair runs once per account, reading again only the conversations that have an image with no caption, and corrects the ones WAHA says are stickers.

Also found: a voice message carries `PTT: true`, its duration (`seconds`) and a `waveform`, and arrives with `Info.MediaType` set to `ptt`. A sticker arrives as `stickerMessage`, `image/webp`.

---

## Delivery Steps

1. **Images, videos and documents.** An endpoint that fetches the file from WAHA when asked and passes it on. The thread shows an image inline, a video with controls, and a document as a download with its name.
2. **Audio.** A player in the bubble, with seeking, telling voice messages from audio files.
3. **Documentation.** Decisions log and guides.

---

## Facts to validate with a real account

Verified in WAHA's docs, not yet with a real file:

- `GET /api/{session}/chats/{chatId}/messages/{messageId}?downloadMedia=true` returns the message with its media. The parameter overrides `WAHA_API_DOWNLOAD_MEDIA`, so `compose.yaml` keeps it `false`.
- `media.url` is `null` when WAHA didn't download the file. `media.mimetype` and `media.filename` stay available, and `filename` is set for documents.
- A downloaded file is served at `GET /api/files/...` with the `X-Api-Key` header. The API sends the header itself, so the key never reaches the browser.

Not documented, and only a real file can answer:

- **WAHA keeps its own copy** of a file it downloaded, in its media storage. That conflicts with the rule that no media stays in the container, so it must be checked how long it stays and how to clean it.
- **Old media:** WhatsApp stops serving old files, so opening an old image may fail. The thread says so, with no raw error.
- **Size:** no limit is documented, so the API sets its own: 25 MB.

---

## Functional Overview

### Step 1 — images, videos and documents

- `GET /whatsapp/conversations/:id/messages/:messageId/media`: finds the stored message, asks WAHA for its media, and returns the file.
- Safe by construction:
  - Only a stored, not deleted message of that conversation that has media, and only while connected.
  - The file is fetched from the path WAHA gives, always on the configured WAHA address, and only if it starts with `/api/files/`. The host in the URL is ignored.
  - The type served comes from an allowlist: images (`jpeg`, `png`, `webp`, `gif`), videos (`mp4`, `webm`) and audio (`ogg`, `mpeg`, `mp4`, `aac`, `webm`). Anything else, including `html` and `svg`, is served as a download with a generic type, never inline.
  - `X-Content-Type-Options: nosniff`, a restrictive `Content-Security-Policy`, a sanitized file name, `Cache-Control: no-store` and a 25 MB limit.
  - No path, URL or key from WAHA reaches the browser or a log.
- The web asks for the file with its normal request (so the origin protection still applies) and shows it from a temporary address that is released when the message leaves the screen.
- `whatsapp_messages` gets `media_filename`, since WAHA gives it with the message and it is shown before the file is opened.
- The thread shows a tile for an image or video, which opens on click, with the image inline and a click to enlarge. A document is a row with its name and a download action. The file is only requested when the user clicks, never when the thread loads.
- States: loading, "Este arquivo não está mais disponível", "Conecte o WhatsApp para abrir arquivos." and a retry.
- WAHA off or disconnected: the message keeps its label and the thread keeps working.

### Step 2 — audio

- A player in the bubble: play and pause, progress and duration, from `seconds`.
- Seeking works from the downloaded file.
- Voice messages (`PTT`) and audio files look different.

---

## Requirements

- Step 1 adds `media_filename` to `whatsapp_messages` with a named migration, which may be applied to the real database.
- The endpoint is a new route in `@vetra/routes`, validated with Zod in `packages/contracts`, with a controller that only parses and calls a service in `packages/core`.
- `packages/infra` gets a function that downloads a message's file, and its errors follow the existing ones.
- New domain errors for a message with no media and for a media that is gone, mapped through their categories.
- No automated tests, as in VET-12. Each step is checked over HTTP and in the browser, with a fake WAHA that serves invented files.

## Acceptance Criteria

- An image, a video and a document open from the thread, and a voice message plays.
- Nothing is saved by Vetra: no file in the project, in Postgres or in logs.
- An old, missing or too large file shows a clear message in Portuguese, and the thread keeps working.
- An `html` or `svg` file can never run in the page.
- With WAHA off, every other screen works and media messages keep their labels.
- Neither the API key nor a file's content appears in logs, errors or responses.
- `pnpm format`, `pnpm check-types`, `pnpm lint` and `pnpm build` pass, with no console errors.

---

## Project References

The executing agent must read these before starting:

- `tasks/VET-12.md`, for how messages are stored and what was decided about WAHA.
- `docs/guides/API-MODULES.md`, `API-VALIDATION.md`, `SHARED-CONTRACTS.md`, `ERROR-HANDLING.md`, `DATABASE.md`
- `docs/guides/WEB-VITE-DATA-LAYER.md`, `WEB-COMPONENTS.md`, `DESIGN-TOKENS.md`
