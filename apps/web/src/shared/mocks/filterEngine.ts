import type { Filter, FilterValue } from "@vetra/contracts";
import { differenceInCalendarDays, isAfter, isBefore, startOfDay } from "date-fns";

import { normalizeText } from "@/shared/utils/text";

export type FilterAccessors<TItem> = Record<string, (item: TItem) => FilterValue | null>;

const dayOf = (value: FilterValue) => startOfDay(new Date(String(value)));

function matchesFilter(actual: FilterValue | null, { operator, values }: Filter): boolean {
  const [first, second] = values;
  const isNegative =
    operator === "is_not" || operator === "is_none_of" || operator === "not_contains";

  if (actual === null || first === undefined) return isNegative;

  switch (operator) {
    case "is":
      return actual === first;
    case "is_not":
      return actual !== first;
    case "is_any_of":
      return values.includes(actual);
    case "is_none_of":
      return !values.includes(actual);
    case "contains":
      return normalizeText(String(actual)).includes(normalizeText(String(first)));
    case "not_contains":
      return !normalizeText(String(actual)).includes(normalizeText(String(first)));
    case "eq":
      return Number(actual) === Number(first);
    case "gt":
      return Number(actual) > Number(first);
    case "lt":
      return Number(actual) < Number(first);
    case "between":
      return typeof first === "number"
        ? Number(actual) >= first && Number(actual) <= Number(second)
        : !isBefore(dayOf(actual), dayOf(first)) && !isAfter(dayOf(actual), dayOf(second ?? first));
    case "before":
      return isBefore(dayOf(actual), dayOf(first));
    case "after":
      return isAfter(dayOf(actual), dayOf(first));
    case "last_days": {
      const days = differenceInCalendarDays(new Date(), dayOf(actual));
      return days >= 0 && days <= Number(first);
    }
  }
}

// Every filter must match (AND); the values inside one filter are alternatives (OR).
export function matchesFilters<TItem>(
  item: TItem,
  filters: Filter[],
  accessors: FilterAccessors<TItem>
): boolean {
  return filters.every((filter) => matchesFilter(accessors[filter.field]?.(item) ?? null, filter));
}

export const distinctOptions = (values: string[]) =>
  [...new Set(values)]
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((value) => ({ value, label: value }));
