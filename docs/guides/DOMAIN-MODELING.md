# Domain Modeling

The reasoning behind `domain.ts` and the domain → service → controller → repository
split described in `API-MODULES.md`. Load this guide before writing or changing
anything in a `domain.ts`, or whenever a service starts encoding a rule that feels
like it should belong to the entity instead.

## Domain-first, not database-first

Two ways to start a feature: design the table, write CRUD operations for it, then a
controller that shuffles data between the request and those operations — or start
from the domain, treating the database as one of the last things to add. Most of a
feature's logic can be written and reasoned about with no database, no HTTP, no
framework at all — just types and functions, testable in isolation.

This is the difference between an **abstraction** (what the system's rules actually
are) and an **implementation detail** (how those rules happen to be persisted or
transported). Implementation details change more often and matter less to the
system's identity, so they're handled last, not first.

## Model data and behavior together, in the same file

Modeling a domain means modeling both what the data **is** and what behavior can be
derived from it — not just the shape you're used to drawing as a database table.
For a future `Lead`, `packages/core/src/features/leads/domain.ts` would hold the
`Lead` type together with its behavior — creating one, which stage transitions are
allowed, whether a follow-up is overdue. The principle holds regardless of how much
behavior a given entity ends up with: **the entity's own file is where every
computation derivable from its data belongs**, grouped into a `<name>Domain` object
(`leadDomain.create`), never scattered across whichever service happens to need it
first.

## Whoever owns the data decides what can be done with it

A hypothetical fuller example, shaped the way a real feature in this codebase would
be — a `loan` feature that tracks whether a `Book` is borrowed:

```ts
// packages/core/src/features/book/domain.ts
export type Book = { id: string; title: string; borrowerId?: string };

export function isAvailable(book: Book): boolean {
  return !book.borrowerId;
}

export const bookDomain = { isAvailable /* , ... */ };
```

There's no `status` field — it's derived from whether `borrowerId` is set. If a
caller needs to know whether a book is available, it asks `bookDomain.isAvailable(book)`
instead of comparing a field itself. If `Book` owns the data, `book`'s own domain
module is what decides what can be concluded from it — not the service that happens
to be calling it, and not the controller even further out.

## Invariants belong in `domain.ts`, not in the caller

An action that changes an entity's state usually has a **pre-condition** (what has to
be true before it's allowed) and a **post-condition** (what's guaranteed true after).
Continuing the example:

```ts
export function markAsBorrowed(book: Book, borrowerId: string): void {
  if (!isAvailable(book)) {
    throw new BookAlreadyBorrowedError("Book is already borrowed");
  }
  book.borrowerId = borrowerId;
}
```

`markAsBorrowed` protects its own invariant (a book can't be borrowed twice) instead
of trusting whatever called it to have checked first. This is the same shape as
`packages/core`'s error hierarchy (`ERROR-HANDLING.md`) — a concrete error thrown from
inside the domain module that owns the rule it's protecting, not thrown from a service
that merely orchestrates.

### Respecting boundaries between two domain modules

If borrowing a book also needs to create a `Loan` record, that creation is `loan`'s
own module's responsibility, even though it's a consequence of an action on `Book`:

```ts
// packages/core/src/features/loan/domain.ts
import { type Book, isAvailable } from "../book/domain";

export type Loan = { id: string; bookId: string; borrowerId: string; borrowedAt: Date };

export function loan(book: Book, borrowerId: string): Loan {
  return { id: uuid(), bookId: book.id, borrowerId, borrowedAt: new Date() };
}
```

A `Loan` is never created by calling `loan()` in isolation from outside — it only
comes into being as a consequence of the `book` feature's own borrowing action
(coordinated one level up, in a service — see below). Each domain module only creates
and mutates the entity it owns.

## Services coordinate; they don't own rules

The application/use-case layer — `packages/core/src/features/<name>/services/` — is
what the system **does**, as opposed to what an entity **is**. A service combines a
domain module's pure behavior with an effect on the outside world (persisting via a
repository):

```ts
// packages/core/src/features/book/services/borrowBook.ts
export async function borrowBook({ bookId, borrowerId }: BorrowBookInput) {
  const book = await bookRepositories.findById({ id: bookId });
  if (!book) throw new BookNotFoundError("Book not found");

  markAsBorrowed(book, borrowerId);
  const newLoan = loanDomain.loan(book, borrowerId);

  await bookRepositories.save({ book });
  await loanRepositories.save({ loan: newLoan });

  return newLoan;
}
```

Describing a feature purely as CRUD (insert, then a couple of updates) is a sign that
part of the system really is that simple, or a sign that domain logic that should live
in a `domain.ts` got left out and pushed into the service instead — worth asking which
one it is when a service starts looking like straight-line CRUD.

## Controllers are adapters, not where logic lives

A service is agnostic about how it gets called — HTTP, a CLI, a background job — it
only knows domain terms (`bookId`, `borrowerId`). `apps/api`'s controllers
(`API-MODULES.md`) are the layer that translates between that internal vocabulary and
the external one (HTTP status codes, request/response bodies). A controller adapts;
it does not decide what's allowed to happen — that decision already happened in
`domain.ts` and `services/`.

## Repositories are the infrastructure layer

The domain and service layers describe _what_ persistence they need (`findById`,
`save`) without knowing _how_ it's implemented. `packages/core/src/features/<name>/repositories/`
is that contract; `packages/database` (and the ORM it wraps) is the implementation
detail behind it — see `DATABASE.md`. This is why a repository function is scoped to
one specific query/shape rather than being a generic parameterized one: it's a
narrow, named contract the service asked for, not a general-purpose data-access
layer.
