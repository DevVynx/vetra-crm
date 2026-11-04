import type { SortDirection } from "@vetra/contracts";
import type { LucideIcon } from "lucide-react";

export type SortOption<TField extends string = string> = {
  id: TField;
  label: string;
  icon: LucideIcon;
  // The direction it starts in when chosen; the user can invert it afterwards.
  defaultDirection: SortDirection;
};

export type SortValue<TField extends string = string> = {
  field: TField;
  direction: SortDirection;
};
