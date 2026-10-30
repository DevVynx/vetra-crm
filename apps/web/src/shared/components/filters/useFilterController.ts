import type { Filter } from "@vetra/contracts";
import { useState } from "react";

import { useHotkey } from "@/shared/hooks/useHotkey";

import { selectOperatorFor } from "./operators";
import type { FilterField } from "./types";

type FilterControllerOptions = {
  fields: FilterField[];
  value: Filter[];
  onChange: (filters: Filter[]) => void;
};

export type FilterController = ReturnType<typeof useFilterController>;

// State shared by the filter button and the chips, which sit in different places of a page.
export function useFilterController({ fields, value, onChange }: FilterControllerOptions) {
  const [openMenu, setOpenMenu] = useState<"button" | "chips" | null>(null);

  // A select field stays while it has values left to add; the other types are filtered once.
  const availableFields = fields.filter((field) => {
    const used = value.find((filter) => filter.field === field.id);
    if (!used) return true;
    if (field.type !== "select") return false;
    return (
      field.isLoadingOptions || field.options.some((option) => !used.values.includes(option.value))
    );
  });
  const canAdd = availableFields.length > 0;

  // F opens the "+" after the chips when there are filters, otherwise the button's menu.
  useHotkey("f", () => setOpenMenu(value.length > 0 ? "chips" : "button"), canAdd);

  const addFilter = (filter: Filter) => {
    const existing = value.find((item) => item.field === filter.field);
    if (!existing) return onChange([...value, filter]);

    const values = [
      ...existing.values,
      ...filter.values.filter((item) => !existing.values.includes(item)),
    ];
    const operator = selectOperatorFor(existing.operator, values.length);
    onChange(value.map((item) => (item === existing ? { ...existing, operator, values } : item)));
  };

  const replaceFilter = (next: Filter) =>
    onChange(value.map((filter) => (filter.field === next.field ? next : filter)));

  const removeFilter = (field: string) =>
    onChange(value.filter((filter) => filter.field !== field));

  return {
    fields,
    value,
    availableFields,
    canAdd,
    openMenu,
    setOpenMenu,
    addFilter,
    replaceFilter,
    removeFilter,
    clear: () => onChange([]),
  };
}
