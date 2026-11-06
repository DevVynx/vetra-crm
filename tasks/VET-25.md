# VET-25 — A separate Docker compose for development

## Goal

Development and the built app (VET-18) should not share Docker volumes, containers or ports. Today the dev
Postgres and WAHA are easy to mix up with the ones of the built app, and two servers using the same WhatsApp
number could both run the automatic sending (VET-20) at the same time.

## Idea (from the conversation, to be decided with the user)

- A compose file only for development, with its own project name (for example `-p vetra-dev`), so volumes and
  networks never collide with the built app.
- Its own volumes for Postgres and for the WAHA session.
- Ports that do not conflict (4720 already belongs to the built app).
- Only Postgres and WAHA: the API and the web keep running with `pnpm dev`, outside Docker.
- The dev WAHA needs a session of its own. Scanning the same number's QR in both makes one drop the other, so
  testing should use a test number, or keep the dev WAHA off while the built app is in use.

## To decide

- The names of the files, the project, the volumes and the ports.
- How `pnpm dev` and the docs (`ENV-CONFIG.md`, the env example) point to the dev compose.
- Whether the automatic sending should refuse to run when the WhatsApp number is shared by two servers.

## Not in this task

Anything about the content of the built image (VET-23) or the update button (VET-24).
