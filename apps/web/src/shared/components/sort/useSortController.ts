import type { SortDirection } from "@vetra/contracts";
import { useState } from "react";

import { useHotkey } from "@/shared/hooks/useHotkey";

import type { SortOption, SortValue } from "./types";

type SortControllerOptions<TField extends string> = {
  options: SortOption<TField>[];
  defaultField: TField;
  value: SortValue<TField> | undefined;
  onChange: (value: SortValue<TField> | undefined) => void;
};

export type SortController<TField extends string = string> = ReturnType<
  typeof useSortController<TField>
>;

export function useSortController<TField extends string>({
  options,
  defaultField,
  value,
  onChange,
}: SortControllerOptions<TField>) {
  const [isOpen, setIsOpen] = useState(false);

  useHotkey("o", () => setIsOpen(true));

  const directionOf = (field: TField) =>
    options.find((option) => option.id === field)?.defaultDirection ?? "asc";

  const defaultValue: SortValue<TField> = {
    field: defaultField,
    direction: directionOf(defaultField),
  };
  const active = value ?? defaultValue;
  const isDefault =
    active.field === defaultValue.field && active.direction === defaultValue.direction;

  // The default order is never written anywhere, so it stays out of the URL.
  const change = (next: SortValue<TField>) =>
    onChange(
      next.field === defaultValue.field && next.direction === defaultValue.direction
        ? undefined
        : next
    );

  return {
    options,
    active,
    activeOption: options.find((option) => option.id === active.field),
    isDefault,
    isOpen,
    setIsOpen,
    selectField: (field: TField) => change({ field, direction: directionOf(field) }),
    selectDirection: (direction: SortDirection) => change({ ...active, direction }),
    restoreDefault: () => onChange(undefined),
  };
}
