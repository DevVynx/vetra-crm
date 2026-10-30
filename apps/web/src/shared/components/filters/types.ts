import type { LucideIcon } from "lucide-react";

export type FilterOption = { value: string; label: string; color?: string };

type FieldBase = { id: string; label: string; icon: LucideIcon };

export type SelectFilterField = FieldBase & {
  type: "select";
  options: FilterOption[];
  isLoadingOptions?: boolean;
};
export type TextFilterField = FieldBase & { type: "text" };
export type NumberFilterField = FieldBase & { type: "number"; format?: "currency" };
export type DateFilterField = FieldBase & { type: "date" };
export type BooleanFilterField = FieldBase & {
  type: "boolean";
  labels: { true: string; false: string };
};

// What a screen hands to the filter bar: nothing in it is specific to leads or customers.
export type FilterField =
  | SelectFilterField
  | TextFilterField
  | NumberFilterField
  | DateFilterField
  | BooleanFilterField;
