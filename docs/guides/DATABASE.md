# Database

Drizzle schema, migrations, and the conventions `packages/database` follows. Load
this guide when adding or changing a table, or touching persistence.

## Ownership

`packages/database` is the only package that imports `drizzle-orm` or knows about
Postgres tables. `apps/api` never imports `@vetra/database` directly —
`packages/core`'s repositories are the only consumers (see `API-MODULES.md`).

## Schema files

One file per table under `src/schema/<table>.ts`, exporting the table as
`<name>Table` (e.g. `leadsTable`) and any Postgres enum as `<name>Enum` (e.g.
`projectStatusEnum`). `src/schema/index.ts` re-exports everything. `src/index.ts` exports the
configured `db` client alongside the schema.

## Shared columns

`src/schema/common.ts` holds reusable column factories — `uuidPrimaryKeyColumn()`,
`createdAtColumn()`, `updatedAtColumn()`, `instantColumn(name)`. Reuse these on a new
table instead of redeclaring `id`/`created_at`/`updated_at` inline. Every instant is a
`timestamptz`, stored and sent by the API in UTC; day and period boundaries come from the
profile time zone.

## Deletes are hard

There is no soft delete and no `deleted_at`: `DELETE` removes the row. What belongs to a
lead goes with it through `ON DELETE CASCADE`, and ledger entries linked to a deleted
project stay, only losing the link (`ON DELETE SET NULL`).

Undo lives in the client. Where a screen offers it (notes, ledger entries), the client keeps
the deleted row and sends it to a `restore` endpoint, which re-creates it with the same `id`
and `created_at`.

## IDs are domain-owned, not database-owned

The `id` column is a `text` primary key with **no** database-generated default — IDs
are generated at the domain layer (`uuidv7()` in `packages/core`'s repository/service
code) and passed in on insert. This keeps ID generation a domain decision, not a
storage detail; don't switch a table to a DB-generated `serial`/`uuid default
gen_random_uuid()` without discussing it first, since callers currently rely on
knowing the ID before the row exists (e.g. to build an entity before persisting it).

## Migration workflow

```bash
pnpm --filter @vetra/database db:generate --name=add_lead_notes   # generate a named migration from schema changes
pnpm --filter @vetra/database db:migrate                          # apply pending migrations
pnpm --filter @vetra/database db:studio                           # inspect data with Drizzle Studio
pnpm db:seed                                                      # fill the database with demo data
```

Always pass `--name`, so the file says what it does instead of getting Drizzle's random
name. Never hand-edit a generated migration file under `migrations/` — change the schema
and regenerate instead.

## Data migrations

When existing rows must change, generate an empty migration with `db:generate --custom
--name=<what_it_does>` and write the SQL in it. It is the one case where the file is written
by hand. Add a column in steps when it must end up `NOT NULL` and unique: add it nullable,
fill it in a custom migration, then require it. Run each on a copy first, and apply to real
data only with the owner's OK.

## Derived columns stay in step through one function

`leads.phone_key` is the phone in a form that compares equal with and without the Brazilian
ninth digit. It is derived, so every write goes through `contactChangeOf`, and a custom
migration fills it with the same rule written in SQL. Change the rule in both places, or in
neither. A unique index on it is what really guarantees one number per lead or customer.

## Subqueries need qualified columns

A single-table `select` in Drizzle drops the table name from its columns, so a correlated
subquery that refers to the outer row must use `qualified(column)`. Without it, the subquery
silently compares against its own table.

## WhatsApp tables

`whatsapp_conversations` and `whatsapp_messages` hold everything imported from the connected
account, including personal conversations. There is no link column to leads: a conversation is
linked by comparing `phone_key` at read time. Photos are stored as URLs only, and a message
keeps the full WAHA id because its edit, delete and reply calls need it. Deleting a message
drops its text and its quote. `pnpm db:seed` never creates conversations.

## Correcting old rows with a one-time read

When a new column or type needs data that old rows never kept, and the data lives in WAHA, a
migration can't fill it. The pattern: a nullable timestamp on `whatsapp_accounts` says when the
correction ran (`stickers_repaired_at`, `audio_details_filled_at`); a new account is created with it
already set, since its first import brings the right data; and the sync runs the correction once when
it is null, reading again only the conversations that have a candidate, through
`helpers/rereadConversations.ts`. To run one again later, a custom migration sets the timestamp back to
null. A correction only ever moves a value forward (a listened audio never becomes unheard).
