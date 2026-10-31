import { ListFilterIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

import { AddFilterMenu } from "./AddFilterMenu";
import type { FilterController } from "./useFilterController";

// Opens the menu to add a filter; sits next to the other page actions.
export function FilterButton({ controller }: { controller: FilterController }) {
  const { availableFields, canAdd, value, openMenu, setOpenMenu, addFilter } = controller;

  return (
    <AddFilterMenu
      fields={availableFields}
      filters={value}
      align="end"
      open={openMenu === "button"}
      onOpenChange={(open) => setOpenMenu(open ? "button" : null)}
      onAdd={addFilter}
      trigger={
        <Button
          variant="outline"
          className="dark:bg-background font-semibold"
          title="Filtrar (F)"
          disabled={!canAdd}
        >
          <ListFilterIcon />
          Filtrar
        </Button>
      }
    />
  );
}
