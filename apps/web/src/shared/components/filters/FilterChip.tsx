import type { Filter, FilterOperator } from "@vetra/contracts";
import { XIcon } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";

import { describeValues, operatorLabel, operatorsFor, selectOperatorFor } from "./operators";
import { OptionList } from "./OptionList";
import type { FilterField } from "./types";
import { ValueEditor } from "./ValueEditor";

type FilterChipProps = {
  field: FilterField;
  filter: Filter;
  onChange: (filter: Filter) => void;
  onRemove: () => void;
};

const segmentClass =
  "hover:bg-accent flex h-full items-center px-2 transition-colors first:rounded-l-md";

function Segment({
  label,
  muted = false,
  children,
}: {
  label: string;
  muted?: boolean;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={`${segmentClass} max-w-48 cursor-pointer truncate border-l ${muted ? "text-muted-foreground" : "font-medium"}`}
      >
        <span className="truncate">{label}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 gap-0 p-0">
        {children(() => setOpen(false))}
      </PopoverContent>
    </Popover>
  );
}

export function FilterChip({ field, filter, onChange, onRemove }: FilterChipProps) {
  const Icon = field.icon;
  const isSelect = field.type === "select";
  const operators = isSelect ? (["is", "is_not"] as FilterOperator[]) : operatorsFor(field);
  const isNegative = filter.operator === "is_not" || filter.operator === "is_none_of";

  const changeOperator = (operator: FilterOperator) =>
    onChange({
      ...filter,
      operator: isSelect ? selectOperatorFor(operator, filter.values.length) : operator,
    });

  const toggleValue = (value: string) => {
    const values = filter.values.includes(value)
      ? filter.values.filter((item) => item !== value)
      : [...filter.values, value];
    if (values.length === 0) return onRemove();
    onChange({ ...filter, operator: selectOperatorFor(filter.operator, values.length), values });
  };

  return (
    <div className="bg-card flex h-8 items-center rounded-md border text-sm">
      <span className="text-foreground flex h-full items-center gap-1.5 px-2 font-medium">
        <Icon className="size-4" />
        {field.label}
      </span>

      {operators.length > 1 ? (
        <Segment label={operatorLabel(filter.operator)} muted>
          {(close) => (
            <OptionList
              searchable={false}
              items={operators.map((operator) => ({
                id: operator,
                label: operatorLabel(operator),
                checked: isSelect
                  ? (operator === "is_not") === isNegative
                  : operator === filter.operator,
              }))}
              onSelect={(operator) => {
                changeOperator(operator as FilterOperator);
                close();
              }}
            />
          )}
        </Segment>
      ) : (
        <span className="text-muted-foreground flex h-full items-center border-l px-2">
          {operatorLabel(filter.operator)}
        </span>
      )}

      <Segment label={describeValues(field, filter)}>
        {(close) => {
          if (field.type === "select") {
            return (
              <OptionList
                multiple
                placeholder="Filtrar..."
                isLoading={field.isLoadingOptions}
                items={field.options.map((option) => ({
                  id: option.value,
                  label: option.label,
                  color: option.color,
                  checked: filter.values.includes(option.value),
                }))}
                onSelect={toggleValue}
              />
            );
          }
          if (field.type === "boolean") {
            return (
              <OptionList
                items={(["true", "false"] as const).map((value) => ({
                  id: value,
                  label: field.labels[value],
                  checked: String(filter.values[0]) === value,
                }))}
                onSelect={(value) => {
                  onChange({ ...filter, values: [value === "true"] });
                  close();
                }}
              />
            );
          }
          return (
            <ValueEditor
              field={field}
              initial={filter}
              autoFocus
              onSubmit={(operator, values) => {
                onChange({ ...filter, operator, values });
                close();
              }}
            />
          );
        }}
      </Segment>

      <button
        type="button"
        aria-label={`Remover filtro ${field.label}`}
        className="text-muted-foreground hover:bg-accent hover:text-foreground flex h-full cursor-pointer items-center rounded-r-md border-l px-1.5 transition-colors"
        onClick={onRemove}
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
}
