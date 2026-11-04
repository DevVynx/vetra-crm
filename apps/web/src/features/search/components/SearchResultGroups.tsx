import type { ComponentType } from "react";

import { CommandGroup, CommandItem } from "@/shared/components/ui/command";

export type SearchResultItem = {
  value: string;
  icon: ComponentType<{ className?: string }>;
  primary: string;
  secondary?: string;
  onSelect: () => void;
};

export type SearchResultGroup = {
  title: string;
  items: SearchResultItem[];
};

// Knows nothing about leads or customers: it only draws groups of items.
export function SearchResultGroups({ groups }: { groups: SearchResultGroup[] }) {
  return groups.map(({ title, items }) => (
    <CommandGroup key={title} heading={title}>
      {items.map(({ value, icon: Icon, primary, secondary, onSelect }) => (
        <CommandItem key={value} value={value} onSelect={onSelect}>
          <Icon className="text-muted-foreground" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate">{primary}</span>
            {secondary && (
              <span className="text-muted-foreground truncate text-xs">{secondary}</span>
            )}
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  ));
}
