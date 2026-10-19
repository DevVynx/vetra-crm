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
`leadStageEnum`). `src/schema/index.ts` re-exports everything. `src/index.ts` exports the
configured `db` client alongside the schema.

## Shared columns

`src/schema/common.ts` holds reusable column factories — `uuidPrimaryKeyColumn()`,
`createdAtColumn()`, `updatedAtColumn()`, `deletedAtColumn()`. Reuse these on a new
table instead of redeclaring `id`/`created_at`/`updated_at`/`deleted_at` inline; every
table follows the same soft-delete shape.

## Soft deletes and unique constraints

Rows are soft-deleted (`deletedAtColumn()`, nullable timestamp, no hard `DELETE`). A
unique index on a column that might legitimately be reused after "deleting" a row
(phone, slug, ...) must filter the index, not just the column:

```ts
uniqueIndex("leads_whatsapp_unique")
  .on(table.whatsapp)
  .where(sql`${table.deletedAt} IS NULL`);
```

Without the `WHERE`, a soft-deleted row permanently blocks reuse of its unique value.

## IDs are domain-owned, not database-owned

The `id` column is a `text` primary key with **no** database-generated default — IDs
are generated at the domain layer (`uuidv7()` in `packages/core`'s repository/service
code) and passed in on insert. This keeps ID generation a domain decision, not a
storage detail; don't switch a table to a DB-generated `serial`/`uuid default
gen_random_uuid()` without discussing it first, since callers currently rely on
knowing the ID before the row exists (e.g. to build an entity before persisting it).

## Migration workflow

```bash
pnpm --filter @vetra/database db:generate   # generate a migration from schema changes
pnpm --filter @vetra/database db:migrate    # apply pending migrations
pnpm --filter @vetra/database db:studio     # inspect data with Drizzle Studio
```

Never hand-edit a generated migration file under `migrations/` — change the schema
and regenerate instead.
