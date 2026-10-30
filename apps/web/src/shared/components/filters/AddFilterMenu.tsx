import type { Filter, FilterValue } from "@vetra/contracts";
import { type ReactElement, useEffect, useRef, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";

import { selectOperatorFor } from "./operators";
import { OptionList } from "./OptionList";
import type { FilterField } from "./types";
import { ValueEditor } from "./ValueEditor";

const FLYOUT_WIDTH = 288;
const VIEWPORT_MARGIN = 24;

type FieldValuesProps = {
  field: FilterField;
  usedValues: FilterValue[];
  onAdd: (filter: Filter) => void;
  onBack: () => void;
};

function FieldValues({ field, usedValues, onAdd, onBack }: FieldValuesProps) {
  if (field.type === "select") {
    return (
      <OptionList
        autoFocus={false}
        placeholder="Filtrar..."
        isLoading={field.isLoadingOptions}
        items={field.options
          .filter((option) => !usedValues.includes(option.value))
          .map((option) => ({ id: option.value, label: option.label, color: option.color }))}
        onBack={onBack}
        onSelect={(value) =>
          onAdd({ field: field.id, operator: selectOperatorFor("is", 1), values: [value] })
        }
      />
    );
  }
  if (field.type === "boolean") {
    return (
      <OptionList
        autoFocus={false}
        placeholder="Filtrar..."
        items={(["true", "false"] as const).map((value) => ({
          id: value,
          label: field.labels[value],
        }))}
        onBack={onBack}
        onSelect={(value) => onAdd({ field: field.id, operator: "is", values: [value === "true"] })}
      />
    );
  }
  return (
    <ValueEditor
      field={field}
      onSubmit={(operator, values) => onAdd({ field: field.id, operator, values })}
    />
  );
}

type MenuBodyProps = {
  fields: FilterField[];
  filters: Filter[];
  onAdd: (filter: Filter) => void;
};

// The field list stays put; the values of the highlighted field open beside it, on hover or
// with the right arrow, and flip to the left when the menu is too close to the screen edge.
function MenuBody({ fields, filters, onAdd }: MenuBodyProps) {
  const [highlight, setHighlight] = useState<{ id: string; top: number } | null>(null);
  const [focusRequest, setFocusRequest] = useState(0);
  const [side, setSide] = useState<"left" | "right">("right");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const fieldsInputRef = useRef<HTMLInputElement>(null);
  const field = fields.find((item) => item.id === highlight?.id);

  // A select field leaves the list once all its values are in use: hand the focus back.
  useEffect(() => {
    if (highlight && !field) {
      setHighlight(null);
      fieldsInputRef.current?.focus({ preventScroll: true });
    }
  }, [field, highlight]);

  useEffect(() => {
    if (focusRequest > 0) flyoutRef.current?.querySelector<HTMLElement>("input, button")?.focus({ preventScroll: true });
  }, [focusRequest]);

  const highlightField = (id: string | undefined, element: HTMLElement | null) => {
    const wrapper = wrapperRef.current;
    if (!id || !element || !wrapper) return setHighlight(null);
    const { right, top: wrapperTop } = wrapper.getBoundingClientRect();
    setSide(right + FLYOUT_WIDTH + VIEWPORT_MARGIN > window.innerWidth ? "left" : "right");
    setHighlight({ id, top: element.getBoundingClientRect().top - wrapperTop });
  };

  return (
    <div ref={wrapperRef} className="relative">
      <OptionList
        inputRef={fieldsInputRef}
        placeholder="Adicionar filtro..."
        hint="F"
        emptyLabel="Nenhum filtro encontrado"
        items={fields.map((item) => ({
          id: item.id,
          label: item.label,
          icon: item.icon,
          hasSubmenu: true,
        }))}
        onActiveChange={highlightField}
        onSelect={(id) => {
          const element = wrapperRef.current?.querySelector<HTMLElement>(`[data-id="${id}"]`);
          highlightField(id, element ?? null);
          setFocusRequest((current) => current + 1);
        }}
      />

      {field && highlight && (
        <div
          key={field.id}
          ref={flyoutRef}
          style={{ top: highlight.top - 4, width: FLYOUT_WIDTH }}
          className={`bg-popover ring-foreground/10 absolute z-50 rounded-lg shadow-md ring-1 ${
            side === "right" ? "left-full ml-1" : "right-full mr-1"
          }`}
        >
          <FieldValues
            field={field}
            usedValues={filters.find((filter) => filter.field === field.id)?.values ?? []}
            onAdd={onAdd}
            onBack={() => fieldsInputRef.current?.focus()}
          />
        </div>
      )}
    </div>
  );
}

type AddFilterMenuProps = {
  fields: FilterField[];
  filters: Filter[];
  trigger: ReactElement;
  align?: "start" | "end";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAdd: (filter: Filter) => void;
};

export function AddFilterMenu({
  fields,
  filters,
  trigger,
  align = "start",
  open: openProp,
  onOpenChange,
  onAdd,
}: AddFilterMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;

  const changeOpen = (next: boolean) => {
    setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger render={trigger} />
      <PopoverContent align={align} className="w-72 gap-0 p-0">
        <MenuBody
          fields={fields}
          filters={filters}
          onAdd={(filter) => {
            onAdd(filter);
            // Select fields stay open so several values can be picked in a row.
            if (fields.find((field) => field.id === filter.field)?.type !== "select") {
              changeOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
