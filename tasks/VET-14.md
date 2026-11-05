# VET-14 — Profile photo

## Objective

Let the user choose a photo for their profile, in Settings, and use it everywhere the user's own avatar shows.

- **What:** a "Foto" row in Settings → Perfil, right under the name, to choose, change and remove the photo.
- **Why:** the user's avatar is only initials today (financial entries of a customer, the user's own voice messages in WhatsApp).
- **Who benefits:** the user, who sees their own photo across the CRM.
- **Architectural direction:** the photo belongs to the profile, which is Vetra's. WhatsApp is not a source for it, so the CRM works the same without a connected number.

---

## Decisions already made with the user

- The photo is chosen **inside Vetra**, in Settings, below the name. It is not read from WhatsApp.
- It is **not stored in Postgres.** It is a file on disk, in a folder of the API (`STORAGE_DIR`, `storage` next to where the API runs by default), outside git.
- It is **converted to WebP** before it is kept, so it is light.
- It is **not shown in the Painel greeting.**
- It shows where the user's avatar already shows: the financial entries of a customer and the user's voice messages in WhatsApp, plus Settings.

## What was decided while planning (and why)

- **A folder of the API, not `apps/web/public`.** The API would have to write into another app's folder, and files added there are served only by the Vite dev server. The API owns the file and serves it, so it works the same in any run.
- **The conversion happens in the browser** (crop to a centered square, 256 px, WebP) so no image library is added to the API. The API only accepts what is a WebP file and small.
- **No migration.** The profile answer carries `photoVersion` (the file's modified time, or `null`), used in the image address so a new photo replaces the old one in the browser's cache.

## Out of scope

- Using the WhatsApp photo, or any other source.
- Showing the photo in the Painel greeting.
- Cropping tools (zoom, move). The photo is cropped to the center.

---

## Requirements

- `GET /profile/photo` serves the file (`image/webp`, `nosniff`, cross-origin allowed for the web app), or 404 without one. `PUT /profile/photo` takes the bytes as the body. `DELETE /profile/photo` removes it.
- The API refuses what is not WebP (checked by the file header, not by the name or type sent) and what is over 512 KB (422).
- The file is written whole or not at all (a temporary file, then renamed).
- `STORAGE_DIR` is a new optional server variable, documented in `ENV-CONFIG.md` and `.env.example`. The folder is in `.gitignore`.
- The web shows the photo with initials as the fallback, from one hook that builds the address.
- No automated tests, as in VET-12 and VET-13. Checked over HTTP and in the browser, with a temporary database and folder.

## Acceptance Criteria

- In Settings the user chooses an image of any common type and it becomes the profile photo, as a small WebP.
- The photo shows in Settings, in the financial entries of customers and in the user's voice messages.
- Removing it brings the initials back everywhere.
- A file that is not WebP, or is too big, sent straight to the API is refused.
- The photo survives restarting the API, and no photo means initials, not an error.
