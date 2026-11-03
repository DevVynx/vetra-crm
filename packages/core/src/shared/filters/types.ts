export type FilterOperator =
  | "is"
  | "is_not"
  | "is_any_of"
  | "is_none_of"
  | "contains"
  | "not_contains"
  | "eq"
  | "gt"
  | "lt"
  | "between"
  | "before"
  | "after"
  | "last_days";

export type FilterValue = string | number | boolean;

export type Filter = {
  field: string;
  operator: FilterOperator;
  values: FilterValue[];
};
