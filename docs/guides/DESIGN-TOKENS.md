# Design Tokens — Color Guide (shadcn/ui)

## Table of Contents

1. [General Structure](#1-general-structure)
2. [Tokens by Context](#2-tokens-by-context)
3. [Decision Tree](#3-decision-tree)
4. [General Rules](#4-general-rules)
5. [Practical Examples](#5-practical-examples)

---

## 1. General Structure

The design system uses CSS custom properties defined in `globals.css`. Each token has a `bg-*` / `text-*` pair that guarantees contrast in both light and dark themes.

```css
/* Actual values from globals.css */
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --primary: #171717;
  --primary-foreground: #fafafa;
  /* ... */
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --primary: #e5e5e5;
  --primary-foreground: #171717;
  /* ... */
}
```

Usage in Tailwind: `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, etc.

---

## 2. Tokens by Context

### 2.1 Page Foundation

| Token             | Usage                       | Rule                                          |
| ----------------- | --------------------------- | --------------------------------------------- |
| `bg-background`   | Main application background | Base of all interface, applied on `body`      |
| `text-foreground` | Default text color          | Primary text for paragraphs, headings, labels |

💡 **In practice:** you'll rarely need to type these two explicitly. shadcn/ui already applies both to `<body>` by default, via `@layer base` at the end of `globals.css`:

```css
@layer base {
  body {
    @apply bg-background text-foreground;
  }
}
```

Only add them manually when deliberately overriding this default on a specific element (e.g. a full-bleed section with a different background).

### 2.2 Containers and Boxes

| Token                                    | Usage                                                  | Example                                       | Rule                                                            |
| ---------------------------------------- | ------------------------------------------------------ | --------------------------------------------- | --------------------------------------------------------------- |
| `bg-card` / `text-card-foreground`       | Cards, panels, containers floating over the background | Product card, dashboard card, modal container | Use when an element needs to stand out from the main background |
| `bg-popover` / `text-popover-foreground` | Elements that appear "on top" of the interface         | Dropdowns, tooltips, select menus, modals     | Whenever an element temporarily overlays content                |

### 2.3 Actions and Buttons

| Token                                            | Usage                             | Example                              | Rule                                             |
| ------------------------------------------------ | --------------------------------- | ------------------------------------ | ------------------------------------------------ |
| `bg-primary` / `text-primary-foreground`         | Primary action button (CTA)       | "Sign In", "Checkout", "Save"        | Only ONE per screen as the most important action |
| `bg-secondary` / `text-secondary-foreground`     | Alternative buttons               | "Cancel", "Back"                     | Secondary action next to primary button          |
| `bg-destructive` / `text-destructive-foreground` | Dangerous or irreversible actions | "Delete Account", "Remove from Cart" | Reserved for critical states and error messages  |

💡 **In practice:** `primary` is the only token whose contrast flips completely between themes — near-black (`#171717`) in light mode, near-white (`#e5e5e5`) in dark mode. That's exactly what makes it read as "the important one" regardless of theme.

💡 **In practice:** `destructive` is the only semantic token that pulls toward red (`#e7000b` light / `#ff6467` dark). If a design needs a reddish highlight for something that isn't actually dangerous, that's a sign `destructive` is being reached for out of habit — use the green promotional exception (rule 6 below) or reconsider the design instead.

### 2.4 Subtle Elements

| Token                    | Usage                                                     | Rule                                         |
| ------------------------ | --------------------------------------------------------- | -------------------------------------------- |
| `bg-muted`               | Discreet backgrounds, inactive tabs, soft highlight areas | Lowers the visual hierarchy of the container |
| `text-muted-foreground`  | Secondary text, placeholders, captions, supporting icons  | Lowers the visual hierarchy of the content   |
| `bg-accent`              | Hover states, user interaction on menus and lists         | Visual interaction feedback                  |
| `text-accent-foreground` | Text on elements with accent background                   | Contrast over bg-accent                      |

### 2.5 Structure and Forms

| Token           | Usage                           | Example                                         |
| --------------- | ------------------------------- | ----------------------------------------------- |
| `border-border` | Default system border           | Separators, layout divisions, container borders |
| `border-input`  | Input and form specific borders | input, textarea, select                         |
| `ring-ring`     | Focus state (focus ring)        | When an input receives focus                    |

💡 **In practice:** the focus ring is applied with the `focus:ring-ring` utility (often paired with `focus-visible:ring-ring` when you only want the ring on keyboard focus, not on mouse click).

### 2.6 Specific Tokens

| Token                          | Usage                    | Rule                                                             |
| ------------------------------ | ------------------------ | ---------------------------------------------------------------- |
| `sidebar-*`                    | Sidebar exclusive colors | Separate to avoid conflict with main content                     |
| `chart-*` (chart-1 to chart-6) | Categorical data colors  | Charts and KPI icons/labels on the Painel; one distinct hue each |

`sidebar-*` mirrors the main token structure, just scoped to the sidebar component so it never fights with the page's own theme:

| Sidebar token                                            | Mirrors                          | Usage                                              |
| -------------------------------------------------------- | -------------------------------- | -------------------------------------------------- |
| `bg-sidebar` / `text-sidebar-foreground`                 | `background` / `foreground`      | Sidebar's own background and default text          |
| `bg-sidebar-primary` / `text-sidebar-primary-foreground` | `primary` / `primary-foreground` | Active/selected nav item                           |
| `bg-sidebar-accent` / `text-sidebar-accent-foreground`   | `accent` / `accent-foreground`   | Hover state on nav items                           |
| `border-sidebar-border`                                  | `border`                         | Divider inside the sidebar (e.g. between sections) |
| `ring-sidebar-ring`                                      | `ring`                           | Focus ring on interactive sidebar elements         |

### 2.7 Status and Funnel Stages

The neutral palette alone makes dense screens hard to scan, so Vetra adds a small set of
colored tokens. They are **accents**: use them for text, icons, dots, thin borders, or a
tinted background at low opacity (`bg-success/10`), never for large surfaces.

| Token                              | Usage                                                   | Example                                 |
| ---------------------------------- | ------------------------------------------------------- | --------------------------------------- |
| `text-success` / `bg-success`      | Positive outcome or money that came in                  | "Recebido", "Tudo em dia"               |
| `text-warning` / `bg-warning`      | Needs attention soon, not yet a problem                 | "A receber", due today                  |
| `text-info` / `bg-info`            | Neutral highlight that should still stand out           | Recurring revenue, informational badges |
| `bg-info` + `text-info-foreground` | The single colored button for a secondary creation flow | "Novo projeto" on the Painel            |
| `stage-*`                          | One color per funnel stage, same everywhere             | Stage badges, Kanban columns, funnel    |

Stage tokens: `stage-prospected`, `stage-demo_published`, `stage-approach_sent`,
`stage-conversing`, `stage-meeting`, `stage-proposal_sent`, `stage-won`, `stage-lost`,
`stage-no_response`. The names match the `LeadStage` values on purpose, so a stage resolves to its color
with `leadStageColor(stage)` (the web's lead stage constants) instead of a per-stage map.

Overdue / error states keep using `destructive` (section 2.3).

---

## 3. Decision Tree

```
Which color to use?

1. Is it a page background?
   ├── Yes → bg-background
   └── No ↓

2. Is it a container/box?
   ├── Is it a card floating over the background? → bg-card
   ├── Is it a popover/dropdown/tooltip? → bg-popover
   └── No ↓

3. Is it a button?
   ├── Is it the main screen action? → bg-primary
   ├── Is it a secondary/alternative action? → bg-secondary
   ├── Is it a destructive action (delete/remove)? → bg-destructive
   └── No ↓

4. Is it a subtle/supporting element?
   ├── Needs a discreet background? → bg-muted
   ├── Is it secondary text/placeholder/caption? → text-muted-foreground
   ├── Is it a hover state? → bg-accent
   └── No ↓

5. Is it structure/border?
   ├── Generic border? → border-border
   ├── Input border? → border-input
   ├── Focus ring? → ring-ring
   └── No ↓

6. Is it something specific?
   ├── Sidebar? → sidebar-*
   ├── Chart or KPI accent? → chart-*
   ├── A lead's funnel stage? → stage-*
   ├── Positive / attention / informational status? → success / warning / info
   └── Otherwise → rethink the design
```

---

## 4. General Rules

1. **Semantics over aesthetics** — Always respect the token semantics, not just the visual appearance. Do not use a color "because it looks pretty"; use the correct token for the correct context.

2. **Theme consistency** — The system must work equally well in light and dark themes. Never use hardcoded colors (fixed hex/rgb) when an equivalent token exists.

3. **Visual hierarchy** — Use `muted` to reduce visual importance, `primary` to highlight, `foreground` as the default.

4. **Destructive actions** — `destructive` is exclusive for irreversible or dangerous actions. Do not use for positive feedback or common actions.

5. **Card vs Popover** — `card` is for persistent containers on the page; `popover` is for temporary elements that overlay content.

6. **Colored accents only through tokens** — Never reach for Tailwind palette utilities (`text-green-600`, `bg-amber-50`); use `success`, `warning`, `info`, `stage-*`, or `chart-*` (section 2.7), and keep them on the element that carries the meaning, not on containers or broad backgrounds.

---

## 5. Practical Examples

```tsx
// ❌ Bad - hardcoded color without context
<div className="bg-[#f5f5f5] text-[#333]">
  <p>Content</p>
</div>

// ✅ Good - semantic tokens
<div className="bg-card text-card-foreground">
  <p>Content</p>
</div>
```

```tsx
// ❌ Bad - primary used where it is not the main action
<button className="bg-primary">Cancel</button>

// ✅ Good - secondary for secondary action
<button className="bg-secondary">Cancel</button>
<button className="bg-primary">Save</button>
```

```tsx
// ❌ Bad - muted used in the wrong place
<p className="text-muted-foreground">Total: $100.00</p> {/* Total is important info */}

// ✅ Good - muted only for secondary text
<p className="text-muted-foreground">Delivery time: 5 business days</p>
<p className="text-foreground font-bold">Total: $100.00</p>
```

```tsx
// ❌ Bad - destructive for a common remove item action
<button className="bg-destructive">Remove from cart</button>

// ✅ Good - destructive exclusive for truly dangerous actions
<button className="bg-destructive">Permanently delete account</button>

// Removing an item from cart is a common, non-destructive action
<button className="text-muted-foreground hover:text-destructive">
  Remove
</button>
```

```tsx
// ❌ Bad - flashy background for a supporting block
<div className="bg-amber-50 p-3">...</div>

// ✅ Good - neutral background with the accent token only on the meaningful element
<div className="bg-muted p-3">
  <span className="text-success font-bold">R$ 900</span> recebido hoje
</div>
```
