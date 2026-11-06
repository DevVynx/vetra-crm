import { useRef } from "react";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@/shared/components/ui/combobox";
import {
  currentTimeIn,
  findTimeZoneOption,
  groupedTimeZoneOptions,
  matchesTimeZoneQuery,
  offsetLabelOf,
  timeZoneCitiesOf,
  type TimeZoneOption,
  type TimeZoneOptionGroup,
  timeZoneTitleOf,
} from "@/shared/utils/timeZoneOptions";

import { TimeZoneFlag } from "./TimeZoneFlag";

type TimeZoneFieldProps = {
  timeZone: string;
  onSelect: (timeZone: string) => void;
  className?: string;
};

function TimeZoneItem({ option }: { option: TimeZoneOption }) {
  const cities = timeZoneCitiesOf(option);

  return (
    <ComboboxItem value={option} className="items-start py-1.5">
      <span className="mt-1">
        <TimeZoneFlag countryCode={option.countryCode} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{timeZoneTitleOf(option)}</span>
        {cities && <span className="text-muted-foreground truncate text-xs">{cities}</span>}
      </span>
      <span className="flex flex-col items-end tabular-nums">
        <span>{currentTimeIn(option)}</span>
        <span className="text-muted-foreground text-xs">{offsetLabelOf(option)}</span>
      </span>
    </ComboboxItem>
  );
}

// Only picks: what happens with the choice is up to the one who uses it.
export function TimeZoneField({ timeZone, onSelect, className = "w-80" }: TimeZoneFieldProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const selected = findTimeZoneOption(timeZone) ?? null;

  const select = (option: TimeZoneOption | null) => {
    if (option && option.name !== selected?.name) onSelect(option.name);
  };

  return (
    <Combobox<TimeZoneOption>
      items={groupedTimeZoneOptions()}
      value={selected}
      onValueChange={select}
      itemToStringLabel={timeZoneTitleOf}
      isItemEqualToValue={(item, value) => item.name === value.name}
      filter={matchesTimeZoneQuery}
    >
      <ComboboxInput
        aria-label="Fuso horário"
        className={className}
        placeholder="Buscar país ou cidade"
        anchorRef={anchorRef}
        startAddon={selected && <TimeZoneFlag countryCode={selected.countryCode} />}
      />
      <ComboboxContent anchor={anchorRef} className="w-96">
        <ComboboxEmpty>Nenhum fuso encontrado.</ComboboxEmpty>
        <ComboboxList>
          {(group: TimeZoneOptionGroup) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel>{group.value}</ComboboxLabel>
              <ComboboxCollection>
                {(option: TimeZoneOption) => <TimeZoneItem key={option.name} option={option} />}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
