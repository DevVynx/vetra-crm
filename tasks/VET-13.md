# VET-13 — Media in WhatsApp conversations

## Objective

Show what people send besides text, and send files back: images, videos and documents that open from the thread, voice messages that play, and the user attaching images, videos and documents to a conversation.

- **What:** media messages stop being a bare label. Images, videos and documents open from the thread, audio plays in it, and the user can send files.
- **Why:** prospects send photos, logos, documents and voice messages, and today the thread only says "Imagem" or "Áudio".
- **Who benefits:** the user, who stops opening the phone to see what a lead sent.
- **Architectural direction:** the files are **never stored by Vetra**. The API asks WAHA for a file only when the user opens it, and passes it on to the browser. The web never talks to WAHA.

Delivered in **steps, each validated by the user before the next one starts**, like VET-12.

---

## Decisions already made with the user

- **Download on demand, nothing kept by Vetra.** No file, no thumbnail and no base64 in Postgres. It follows the earlier rule of not storing images (VET-12 profile photos).
- **Sending files was added later, at the user's request.** It follows the same rule: Vetra never stores a file. A file goes from the browser to the API to WAHA and is forgotten.
- **View-once messages were dropped** (see "What was found about view-once").
- Tests never use the real account or database. Anything that needs a real file is checked by the user, in a conversation they choose.

## Out of scope

- View-once messages.
- Sending stickers, GIFs, contacts, locations, polls and reactions.
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
3. **Sending files.** Attach, drop or paste images, videos and documents, add a caption, and send them. Voice recording is decided separately (see below).
4. **Documentation.** Decisions log and guides, including this step.

---

## Facts to validate with a real account

Verified in WAHA's docs, not yet with a real file:

- `GET /api/{session}/chats/{chatId}/messages/{messageId}?downloadMedia=true` returns the message with its media. The parameter overrides `WAHA_API_DOWNLOAD_MEDIA`, so `compose.yaml` keeps it `false`.
- `media.url` is `null` when WAHA didn't download the file. `media.mimetype` and `media.filename` stay available, and `filename` is set for documents.
- A downloaded file is served at `GET /api/files/...` with the `X-Api-Key` header. The API sends the header itself, so the key never reaches the browser.

For sending, WAHA's docs list `POST /api/sendImage`, `/api/sendVideo`, `/api/sendVoice` and `/api/sendFile`, all supported on GOWS. The body takes `session`, `chatId` and `file` (`mimetype`, `filename`, and the content as `data` in base64 or as a `url`), with `caption` for an image and a video. The docs say WhatsApp works best with images in JPEG, and that a voice message must be OGG with OPUS (`convert: true`, or ffmpeg). The body of `sendFile` was not in the part of the page that could be read.

Not documented, and only a real file can answer:

- **WAHA keeping its own copy** of a file it downloaded was checked with real files, opened by the user: the container's temporary folder for files was empty, and no media file existed outside the image's own demo assets. Only counts and sizes were read. So nothing needs cleaning, and the rule that no media stays in the container holds.
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
- Voice messages (`PTT`) and audio files look different: a microphone or a note icon.
- The length (`seconds`) and the voice mark come with the message and are stored in `media_seconds` and `is_voice`, so the length shows before the file is opened. Audio stored before that is filled in once per account, reading again only the conversations that have audio with no length, with the same reader the sticker repair uses.
- Only one audio plays at a time, and the file is asked for once, on the first play.
- A voice message looks like WhatsApp's: the play button, the bars with a dot that follows the position and can be clicked to seek, the length under them, and the contact's photo at the right with a microphone. The bars come from the `waveform` WAHA gives (bytes in base64), stored in `media_waveform`; without it a flat line shows.
- The microphone is gray until the audio was listened to, and blue after. For what the user sent, WAHA's `PLAYED` receipt says so. For what was received, it turns blue when the user plays it in Vetra, or when WAHA reports it played on the phone. Playing in Vetra is marked only in Vetra: WhatsApp is not told, so the person who sent it does not see it as listened. `is_played` only ever goes up.

### Step 3 — sending files

- **Attach:** a paperclip button in the message box, dragging a file over the thread, and pasting an image from the clipboard. The three go through the same place.
- **Component:** Dice UI's **File Upload**, from the registry the project already has set up (`@diceui`, in `components.json`). Its Base UI version uses the same library as the rest of the interface (`@base-ui/react` and `@base-ui/utils`), plus the `direction` component the project already has. It brings dragging, pasting, accepted types, maximum size and count, a reason for each refused file, preview and progress, so none of that is written by hand. It is added as a file under `shared/components/ui`, like the others.
- **Before sending:** each chosen file shows a preview (the image itself, or an icon and the name for a video and a document) with a button to remove it, and one caption field for an image and a video. Nothing leaves the browser until the user sends.
- **Types:** an image goes as an image, a video as a video, and anything else as a document with its own name. A file over the limit, or not accepted, is refused with the reason, in Portuguese.
- **Limit:** 25 MB per file, the same as when opening one, and a few files at a time.
- **How it travels:** one request per file, with the bytes as the body and the name, type and caption in the request, so no new dependency is needed. The API checks the size while reading, refuses what is too big, and passes the file on to WAHA as base64. WAHA restrictions (`463`, `475`) become the same message as for text.
- **Stored:** the message, with its type, file name and caption, like a received one. Not the file.
- **In the thread:** the sent file shows like any other, with the ticks, and opens the same way. It can be deleted for everyone, like any message of the user's.
- **Voice recording from the microphone is not in this step.** A browser records in WebM, and WhatsApp needs OGG with OPUS, which WAHA converts only with ffmpeg. Whether the free image can do it is not documented, so it is checked first and decided with the user.
- **Built as:** the thread is wrapped in the File Upload component (`ThreadAttachments`), which holds the chosen files and their captions. The paperclip, the drop over the thread and the paste only add files; the tray (`AttachmentTray`) shows them, and sending goes one file at a time. If one fails, the reason is shown and what was not sent stays in the tray. Text pasted into the message box is left alone, and a drag that carries no file shows nothing. An image sent as JPEG, PNG or WebP and an MP4 go as photo and video; a GIF and a QuickTime video go as documents, since WhatsApp only plays MP4. The size is checked in the browser and again in the API (over 25 MB is a 422).
- **Checked** over HTTP and in the browser with the fake WAHA: every type goes to the right endpoint with the bytes intact, captions (not for documents), 25 MB exactly and one byte over, restrictions (429, nothing stored), disconnected (409), attach, remove, caption, paste, drop, refusals in Portuguese, a failure keeping the rest, phone width.
- **Real checks:** with the user, sending one image, one video and one document to a contact they choose. WAHA's real behavior for `sendFile` and whether images need converting to JPEG are only known after that.

---

## Requirements

- Step 1 adds `media_filename` to `whatsapp_messages` with a named migration, which may be applied to the real database.
- The endpoint is a new route in `@vetra/routes`, validated with Zod in `packages/contracts`, with a controller that only parses and calls a service in `packages/core`.
- `packages/infra` gets a function that downloads a message's file, and its errors follow the existing ones.
- New domain errors for a message with no media and for a media that is gone, mapped through their categories.
- Step 3 adds an upload route in `@vetra/routes`, validated with Zod in `packages/contracts`, a `sendFile` function in `packages/infra`, and a service in `packages/core` that stores the message without the file.
- No automated tests, as in VET-12. Each step is checked over HTTP and in the browser, with a fake WAHA that serves invented files.

## Acceptance Criteria

- An image, a video and a document open from the thread, and a voice message plays.
- An image, a video and a document can be sent by attaching, dragging or pasting, with a caption, and show in the thread like any message.
- A file that is too big or not accepted is refused with the reason, and nothing is stored by Vetra.
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
