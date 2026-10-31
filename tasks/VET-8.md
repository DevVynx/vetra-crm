# VET-8 — Customizable pipeline stages (Configurações)

## Objective

Make the pipeline stages editable. Today the nine stages are a fixed list hardcoded in the contracts, labels, colors, filters, dashboard and mocks. Each user must be able to shape their own funnel (rename, recolor, reorder, add and remove stages) from a basic **Configurações** page, with the current stages shipped only as a default preset.

- **What:** stages become data (name, color, order, role) instead of an enum; a "Etapas" section in Configurações to manage them; every screen that depends on stages reads them from that data.
- **Why:** Vetra is shared with other freelancers (the ViziClub community) and each one sells and prospects differently; a fixed funnel does not fit everyone.
- **Who benefits:** every CRM user.
- **Direction:** the code stops depending on stage names and depends on stage **roles** (entry, middle, closing, archive). The backend does not exist yet, so the contracts and the mock layer define the behavior.

---

## Scope

- Stage model and contracts in `packages/contracts`, replacing `leadStageSchema` / `liveStageSchema` as the source of truth.
- Mock endpoints to list, create, update, reorder and delete stages.
- A basic Configurações page with a "Etapas do funil" section.
- Adapting every consumer of stages: lead list and filters, lead detail (stepper, archive and reactivate flows), customers, dashboard (funnel, KPIs, conversion), stage colors and badges.
- Default preset with 10 suggested colors, and a free color picker.
- Remove the "Demo publicado" stage from the preset.

Out of scope: other Configurações sections, resetting to the preset, per-stage automation, real API and database, importing or exporting stage setups.

---

## Functional Overview

### Stage roles

- **Entry** — the first stage; where new leads are created. Exactly one. Cannot be deleted or moved.
- **Middle** — any number of stages between entry and closing. At least one.
- **Closing** — the last funnel stage; reaching it turns the lead into a customer (it keeps opening the closing sheet with the deal value). Exactly one. Cannot be deleted or moved.
- **Archive** — stages outside the funnel where leads are parked (in the preset: "Sem resposta" and "Perdido"). At least one, any number.

So the minimum is three funnel stages plus one archive stage.

### Default preset

Funnel: Prospectado (entry) → Abordagem enviada → Conversando → Reunião → Proposta enviada → Fechado (closing). Archive: Sem resposta, Perdido. "Demo publicado" is removed.

### Editing a stage

- Name and color can be changed on any stage, including entry and closing.
- Renaming or recoloring never moves leads: they stay in the same stage, which now shows the new name and color. When the stage has leads, show a notice: "N leads usam esta etapa; a mudança vale para todos eles."

### Deleting a stage

- **Funnel (middle) stage:** the leads move to the **previous stage in order** (for the first middle stage, that is the entry stage), with a confirmation that states how many leads will move and to which stage. The previous stage always exists, because the entry stage cannot be deleted.
  - The last middle stage cannot be deleted.
- **Archive stage:** the leads move to the previous archive stage in order (for the first archive stage, to the next one). The last archive stage cannot be deleted.
- Entry and closing stages cannot be deleted.
- A stage without leads is deleted with a simple confirmation.

### Adding and reordering

- "Adicionar etapa" creates a middle stage (in the funnel list) or an archive stage (in the archive list), with a name and a color.
- Middle stages are reordered by drag and drop with a handle; the entry stage stays first and the closing stage stays last, locked. Archive stages are reordered in their own list.
- The order drives the stepper, the filters, the funnel chart and the "previous stage" rule used when a stage is deleted.

### Colors

- Each stage has one color, chosen from 10 suggested preset colors or a free color picker (hex).
- The same color is used by the stage badge, the stepper and the dashboard funnel, and must remain readable in light and dark themes.

### Archiving a lead

- With one archive stage: a plain confirmation, no question about the reason.
- With two or more: the confirmation keeps the choice of archive stage, defaulting to the first one.
- The lead keeps remembering the stage where it stopped, and "Reativar" returns to it (or to the entry stage when none).

### Dashboard

- The "Em negociação" KPI becomes **"Leads ativos"**: the number of leads in any funnel stage that is not the closing stage nor an archive stage. Below it: "X em {name of the last middle stage}" (the last stage before closing), replacing "X com proposta".
- The funnel chart, its colors and the conversion by niche are built from the configured stages in order (the closing stage counts as won).

### Filters

- The Etapa filter lists the configured stages, funnel stages first and archive stages after, in order. Archived leads keep showing only when the filter includes an archive stage.

---

## UI Elements

**Configurações → Etapas do funil**
- A list of funnel stages: drag handle, color swatch (opens the color picker), name editable in place, lead count, delete button; entry and closing rows show a lock instead of the handle and no delete button
- "Adicionar etapa" button below the list
- A second list "Arquivamento" with the same row, and its own "Adicionar etapa" button

**Color picker popover**
- 10 preset swatches and the free picker with hex input

**Delete dialog**
- Lead count, destination stage (the previous one) and confirmation

**Edit notice**
- Inline notice when the stage being edited has leads

**Archive dialog**
- Confirmation only (one archive stage) or confirmation with the archive stage choice (two or more)

**Painel**
- "Leads ativos" card with the last-middle-stage sub line

---

## Requirements

- No component or rule may reference a stage by name or by the old enum value; behavior depends on the stage role and on the order.
- A lead stores a stage identifier; stage names and colors are looked up from the stage list so that edits apply everywhere at once.
- Server-side invariants (also enforced in the mock): exactly one entry and one closing stage, at least one middle and one archive stage, entry first and closing last, unique ids, valid hex colors, non-empty names.
- Stage list is loaded once and cached with TanStack Query; every screen reads from the same query. Changing stages invalidates the leads, customers and dashboard queries.
- Reuse existing abstractions: `FormSheet` or `ConfirmDialog`, `Section`, `SectionEmptyRow`, the filter component's field options, the existing mutation toast-with-undo convention where it applies.
- UI text is Portuguese and hardcoded.

---

## Backend Requirements

### Contracts

In `packages/contracts/src/leads/` (a `stage` resource file, following `SHARED-CONTRACTS.md`):

- `stageRoleSchema`: `entry` | `middle` | `closing` | `archive`.
- `stageSchema`: `id`, `name`, `color` (hex), `role`, `position`.
- `listStagesResponseSchema`: `{ stages: Stage[] }`.
- `createStageRequestSchema`: `name`, `color`, `role` (only `middle` or `archive`); `createStageResponseSchema` = `stageSchema`.
- `updateStageRequestSchema`: `name`, `color`; `updateStageResponseSchema` = `stageSchema`.
- `reorderStagesRequestSchema`: ordered list of ids per group; `reorderStagesResponseSchema` = the list of stages.
- `deleteStageResponseSchema` = `z.void()`.
- `LeadSummary.stage` and `stoppedAtStage` become the stage id (string); the old `leadStageSchema`, `liveStageSchema`, `updateLeadStageRequest` and the dashboard funnel step use ids.

### API (mock now, same shape later)

- `GET /stages`, `POST /stages`, `PATCH /stages/:id`, `PUT /stages/order`, `DELETE /stages/:id`.
- Deleting applies the lead-moving rules and rejects the forbidden cases (entry, closing, last middle, last archive) with a conflict error that the web turns into the Portuguese message.

### Database

Not part of this issue (the backend does not exist yet). The model implies a `stages` table (id, name, color, role, position) with leads referencing it.

---

## Frontend Requirements

- Install the needed Dice UI components, adapting import paths to `@/shared/components/ui`:
  - **Sortable** (`@diceui/sortable`) for drag-and-drop reordering.
  - **Color Picker** and **Color Swatch** (`@diceui/color-picker`) for the color field.
  - **Editable** (`@diceui/editable`) for the in-place name edit.
  The base variants are built on Base UI, like the project; `Sortable` brings `@dnd-kit/*` and `@base-ui/utils` as dependencies.
- Replace `leadStageLabels`, `leadStageColor`, `funnelStages` and the `--stage-*` CSS variables with data from the stage query, keeping a stable helper for color and label lookup.
- Adapt the stepper, stage badge, lead and customer lists, filters, `LeadActionsMenu`, `ArchiveLeadDialog`, `useChangeLeadStage`, and the dashboard components.
- Loading, error and empty states for the Configurações page; keyboard-accessible reordering.

---

## Technical Notes

- Roles drive logic, not names: closing opens the closing sheet and turns the lead into a customer; entry is where leads start and where reactivation falls back; archive stages feed the archive filter.
- Mock data: the sample leads that were in "Demo publicado" move to the entry stage; mock-only rules that used stage names (no last contact before first contact, outbound-only conversation after the first approach) use the entry stage and the stage right after it.
- Stage colors stored as hex; light and dark rendering must derive readable text and background tints from the chosen color.
- Keep the stage list the single source of truth; do not duplicate it in other constants.

---

## Testing Requirements

The project has no automated test setup yet; cover manually, or with unit tests if a setup exists by then:

- Stage invariants: creating, deleting and reordering never breaks the entry/closing/middle/archive rules.
- Delete: leads move to the previous stage (the entry stage for the first middle one); entry, closing, last middle and last archive cannot be deleted.
- Rename and recolor keep leads in place.
- Dashboard "Leads ativos" and the last-middle-stage sub line after reordering and deleting.
- Archive dialog with one and with several archive stages.

---

## Acceptance Criteria

- The Configurações page lists funnel stages and archive stages with name, color, lead count and the correct locks.
- Stages can be renamed, recolored, added, reordered and deleted following the rules above, with the notices and messages described.
- Deleting a stage moves its leads to the previous stage, with a confirmation that names the destination and the number of leads.
- No screen, filter, badge, chart or mock still depends on the old stage names; changing the stage list changes all of them without code changes.
- The preset no longer has "Demo publicado".
- The archive flow asks for the reason only when there are two or more archive stages.
- The Painel shows "Leads ativos" with the "X em {last middle stage}" line, and the funnel uses the configured stages and colors.
- The colors are readable in light and dark themes.
- Contracts follow `SHARED-CONTRACTS.md`; `pnpm format`, `pnpm check-types` and `pnpm build` pass and the app has no console errors.

---

## Project References

The executing agent must read these before starting:

- `docs/project/PROJECT-OVERVIEW.md`
- `docs/guides/SHARED-CONTRACTS.md`
- `docs/guides/WEB-COMPONENTS.md`
- `docs/guides/WEB-VITE-OVERVIEW.md`
- `docs/guides/WEB-VITE-DATA-LAYER.md`
- `docs/guides/DESIGN-TOKENS.md`
- `apps/web/src/shared/components/filters/README.md` (stage filter field)

Project-specific decisions that apply to this issue:

- Front-end only, with the mock layer in `apps/web/src/shared/mocks`.
- Stage editing never moves leads; only deleting a stage does, and it moves them to the previous stage.
- The minimum is one entry, one middle, one closing and one archive stage.
- "Em negociação" is replaced by "Leads ativos"; there is no per-stage "counts as negotiating" flag.
