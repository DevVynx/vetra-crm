import type { Filter, FilterOperator, FilterValue } from "@vetra/contracts";
import { type FormEvent, useState } from "react";

import { DateTimePicker } from "@/shared/components/DateTimePicker";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { selectedChoiceClass } from "@/shared/constants/choiceStyles";
import { cn } from "@/shared/utils/cn";
import { atDefaultHour } from "@/shared/utils/dueDates";
import { centsToInput, parseCurrencyToCents } from "@/shared/utils/format";
import { maskCurrency } from "@/shared/utils/masks";

import { operatorLabel, operatorsFor } from "./operators";
import type { DateFilterField, NumberFilterField, TextFilterField } from "./types";

type EditableField = TextFilterField | NumberFilterField | DateFilterField;

type ValueEditorProps = {
  field: EditableField;
  initial?: Filter;
  autoFocus?: boolean;
  onSubmit: (operator: FilterOperator, values: FilterValue[]) => void;
};

const toText = (field: EditableField, value: FilterValue | undefined) => {
  if (value === undefined) return "";
  return field.type === "number" ? centsToInput(Number(value)) : String(value);
};

const toDate = (value: FilterValue | undefined) =>
  value === undefined ? atDefaultHour(new Date()) : new Date(String(value));

// Operator plus one or two inputs, for the field types whose value is typed or picked.
export function ValueEditor({ field, initial, autoFocus = false, onSubmit }: ValueEditorProps) {
  const operators = operatorsFor(field);
  const [operator, setOperator] = useState<FilterOperator>(initial?.operator ?? operators[0]!);
  const [texts, setTexts] = useState([
    toText(field, initial?.values[0]),
    toText(field, initial?.values[1]),
  ]);
  const [dates, setDates] = useState([toDate(initial?.values[0]), toDate(initial?.values[1])]);

  const needsTwo = operator === "between";
  const isDays = field.type === "date" && operator === "last_days";

  const values = (): FilterValue[] | null => {
    const slots = needsTwo ? 2 : 1;
    if (field.type === "date" && !isDays) {
      return dates.slice(0, slots).map((date) => date.toISOString());
    }
    const typed = texts.slice(0, slots).map((text) => text.trim());
    if (typed.some((text) => text === "")) return null;
    if (field.type === "text") return typed;
    if (isDays) {
      const days = Number(typed[0]);
      return Number.isInteger(days) && days > 0 ? [days] : null;
    }
    const cents = typed.map(parseCurrencyToCents);
    return cents.every((value) => value !== null) ? cents : null;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = values();
    if (result) onSubmit(operator, result);
  };

  const setText = (index: number, value: string) =>
    setTexts((current) => current.map((text, position) => (position === index ? value : text)));

  const renderInput = (index: number) => {
    if (field.type === "date" && !isDays) {
      return (
        <DateTimePicker
          key={index}
          value={dates[index]!}
          withTime={false}
          allowPast
          onChange={(date) =>
            setDates((current) =>
              current.map((item, position) => (position === index ? date : item))
            )
          }
        />
      );
    }
    return (
      <Input
        key={index}
        autoFocus={autoFocus && index === 0}
        inputMode={field.type === "text" ? "text" : "numeric"}
        placeholder={
          field.type === "text" ? "Digite o texto" : isDays ? "Número de dias" : "R$ 0,00"
        }
        value={texts[index]}
        onChange={(event) => {
          const raw = event.target.value;
          setText(
            index,
            field.type === "number" ? maskCurrency(raw) : isDays ? raw.replace(/\D/g, "") : raw
          );
        }}
      />
    );
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 p-3">
      <div className="flex gap-1">
        {operators.map((item) => (
          <Button
            key={item}
            type="button"
            size="xs"
            variant="outline"
            className={cn("px-1.5 whitespace-nowrap", item === operator && selectedChoiceClass)}
            onClick={() => setOperator(item)}
          >
            {operatorLabel(item)}
          </Button>
        ))}
      </div>
      {renderInput(0)}
      {needsTwo && renderInput(1)}
      <Button type="submit" size="sm" className="font-semibold" disabled={values() === null}>
        Aplicar
      </Button>
    </form>
  );
}
