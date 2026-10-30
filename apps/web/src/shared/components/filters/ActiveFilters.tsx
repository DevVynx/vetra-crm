import { PlusIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";

import { AddFilterMenu } from "./AddFilterMenu";
import { FilterChip } from "./FilterChip";
import type { FilterController } from "./useFilterController";

// The chips of the filters in use, with a "+" to add more and a button to clear them all.
// Renders nothing, and so takes no space, while there is no filter.
export function ActiveFilters({ controller }: { controller: FilterController }) {
  const {
    fields,
    value,
    availableFields,
    canAdd,
    openMenu,
    setOpenMenu,
    addFilter,
    replaceFilter,
    removeFilter,
    clear,
  } = controller;

  if (value.length === 0) return null;

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex min-h-8 flex-wrap items-center gap-2">
        {value.map((filter) => {
          const field = fields.find((item) => item.id === filter.field);
          return (
            field && (
              <FilterChip
                key={filter.field}
                field={field}
                filter={filter}
                onChange={replaceFilter}
                onRemove={() => removeFilter(filter.field)}
              />
            )
          );
        })}
        {canAdd && (
          <AddFilterMenu
            fields={availableFields}
            filters={value}
            open={openMenu === "chips"}
            onOpenChange={(open) => setOpenMenu(open ? "chips" : null)}
            onAdd={addFilter}
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Adicionar filtro"
                title="Adicionar filtro (F)"
              >
                <PlusIcon className={cn("transition-transform", openMenu === "chips" && "rotate-45")} />
              </Button>
            }
          />
        )}
      </div>

      <Button variant="ghost" size="sm" className="shrink-0" onClick={clear}>
        Limpar
      </Button>
    </div>
  );
}
