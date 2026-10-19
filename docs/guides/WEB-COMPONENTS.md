# Web Components

shadcn/ui conventions and component organization. Load this guide when adding a UI
primitive, a new form, or deciding where a component should live.

## shadcn/ui primitives

`shared/components/ui/*.tsx` (button, card, input, label, separator, sonner, spinner,
field, ...) are shadcn-generated primitives — treat them as vendored code. Add a new
primitive through the shadcn CLI (`components.json` is already configured for this
project) instead of hand-rolling one shadcn already provides.

If this project's web app needs a `"use client"` directive on some primitives and
not others, that rule is covered in its own overview guide — it depends on how that
framework renders components, not on shadcn itself.

## Component size

A component file should stay around **200 lines or less**. That's a soft ceiling, not
a hard cutoff to game — the point is that a component should read as a short,
readable piece of UI, not a wall of JSX with everything (layout, form logic, several
unrelated pieces of UI) crammed into one function. If a component keeps growing past
that, componentize: pull a self-contained piece of markup into its own component
(even if it's only used once), or pull non-rendering logic (validation, formatting,
a chunk of handlers) into a hook or a plain function instead of inlining it in the
component body. Prefer several small, named, readable components over one big one —
the name of the extracted piece is documentation the inlined JSX never gives you.

## Combining class names

`cn()` (`shared/utils/cn.ts`, `clsx` + `tailwind-merge`) is the only way class names
are ever combined conditionally. Never build a class string by template-literal
concatenation — `tailwind-merge` is what resolves conflicting Tailwind classes (e.g. a
default padding overridden by a prop) correctly.

## Where a component lives

- `shared/components/ui/` — shadcn primitives only.
- `shared/components/` — composed, cross-feature components (e.g.
  `ThemeToggle`, `Notification`).
- `features/<name>/components/` — anything specific to one feature's screens (e.g.
  `LeadForm`, `LeadsTable`). Don't move a feature component into `shared/` until a
  second feature actually needs it.

## Forms

Every form uses `react-hook-form`, with the schema colocated in the same file as the
form component, right above it, since it only describes that form's own fields (it
does not need to match a `packages/contracts` schema one-to-one — the contracts
schema is what the API validates against; the form schema is what the UI validates
against, and may be a subset or a superset, e.g. adding a client-only
cross-field check). The form component itself is a default-exported function
component. On submit, an error is always turned into user-facing text before being
shown — never a raw error object rendered directly. The error-to-text path is
covered in `WEB-VITE-DATA-LAYER.md`.
