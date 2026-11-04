import type { Filter, FilterOperator } from "@vetra/contracts";
import { format } from "date-fns";

import { inProfileZone } from "@/shared/time-zone/zonedDate";
import { formatCurrency } from "@/shared/utils/format";

import type { FilterField } from "./types";

const operatorLabels: Record<FilterOperator, string> = {
  is: "é",
  is_not: "não é",
  is_any_of: "é um de",
  is_none_of: "não é um de",
  contains: "contém",
  not_contains: "não contém",
  eq: "igual a",
  gt: "maior que",
  lt: "menor que",
  between: "entre",
  before: "antes de",
  after: "depois de",
  last_days: "nos últimos",
};

export const operatorLabel = (operator: FilterOperator) => operatorLabels[operator];

// Select fields offer only "é" and "não é": the plural form follows the number of values.
const operatorsByType: Record<FilterField["type"], FilterOperator[]> = {
  select: ["is", "is_not"],
  text: ["contains", "not_contains"],
  number: ["eq", "gt", "lt", "between"],
  date: ["before", "after", "between", "last_days"],
  boolean: ["is"],
};

export const operatorsFor = (field: FilterField) => operatorsByType[field.type];

export function selectOperatorFor(operator: FilterOperator, valueCount: number): FilterOperator {
  const isNegative = operator === "is_not" || operator === "is_none_of";
  if (valueCount > 1) return isNegative ? "is_none_of" : "is_any_of";
  return isNegative ? "is_not" : "is";
}

const displayDate = (value: unknown) => format(inProfileZone(String(value)), "dd/MM/yyyy");

export function describeValues(field: FilterField, { operator, values }: Filter): string {
  switch (field.type) {
    case "select":
      return values
        .map(
          (value) => field.options.find((option) => option.value === value)?.label ?? String(value)
        )
        .join(", ");
    case "boolean":
      return field.labels[String(values[0]) === "true" ? "true" : "false"];
    case "number":
      return values.map((value) => formatCurrency(Number(value))).join(" e ");
    case "date":
      if (operator === "last_days") return `${values[0]} dias`;
      return values.map(displayDate).join(" e ");
    case "text":
      return String(values[0]);
  }
}
