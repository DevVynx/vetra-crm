import type { LucideIcon } from "lucide-react";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { type KeyboardEvent, type Ref, useEffect, useRef, useState } from "react";

import { Checkbox } from "@/shared/components/ui/checkbox";
import { cn } from "@/shared/utils/cn";
import { normalizeText } from "@/shared/utils/text";

export type OptionListItem = {
  id: string;
  label: string;
  icon?: LucideIcon;
  color?: string;
  checked?: boolean;
  hasSubmenu?: boolean;
};

type OptionListProps = {
  items: OptionListItem[];
  placeholder?: string;
  hint?: string;
  emptyLabel?: string;
  isLoading?: boolean;
  multiple?: boolean;
  // Hides the search box but keeps it focusable, so the arrows and Enter still work.
  searchable?: boolean;
  autoFocus?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  // Fires as the highlight moves (arrows or hover), with the row element for positioning.
  onActiveChange?: (id: string | undefined, element: HTMLElement | null) => void;
  onSelect: (id: string) => void;
  onBack?: () => void;
};

// Searchable list driven by the keyboard: arrows move, Enter or → picks, ← goes back while
// the search is empty, Escape is left to the popover that hosts it.
export function OptionList({
  items,
  placeholder,
  hint,
  emptyLabel = "Nada encontrado",
  isLoading = false,
  multiple = false,
  searchable = true,
  autoFocus = true,
  inputRef,
  onActiveChange,
  onSelect,
  onBack,
}: OptionListProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const reported = useRef<string | undefined>(undefined);

  const visible = items.filter((item) => normalizeText(item.label).includes(normalizeText(query)));
  const active = Math.min(activeIndex, Math.max(visible.length - 1, 0));

  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  // Reported only after the user moves, so a flyout does not open by itself with the menu.
  const moveTo = (index: number) => {
    setActiveIndex(index);
    reported.current = visible[index]?.id;
    const element = listRef.current?.children[index] as HTMLElement | undefined;
    onActiveChange?.(visible[index]?.id, element ?? null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const item = visible[active];
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveTo(Math.min(active + 1, visible.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveTo(Math.max(active - 1, 0));
    } else if (event.key === "Enter" && item) {
      event.preventDefault();
      onSelect(item.id);
    } else if (event.key === "ArrowRight" && item?.hasSubmenu) {
      event.preventDefault();
      onSelect(item.id);
    } else if (event.key === "ArrowLeft" && query === "" && onBack) {
      event.preventDefault();
      onBack();
    }
  };

  return (
    <div className="flex flex-col">
      <div className={cn("flex items-center gap-2 border-b px-3 py-2", !searchable && "sr-only")}>
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={query}
          placeholder={placeholder}
          aria-label={placeholder}
          className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            reported.current = undefined;
            onActiveChange?.(undefined, null);
          }}
          onKeyDown={handleKeyDown}
        />
        {hint && (
          <kbd className="text-muted-foreground rounded border px-1.5 text-xs font-medium">
            {hint}
          </kbd>
        )}
      </div>

      <ul ref={listRef} role="listbox" className="max-h-72 overflow-y-auto p-1">
        {isLoading && <li className="text-muted-foreground px-2 py-2 text-sm">Carregando…</li>}
        {!isLoading && visible.length === 0 && (
          <li className="text-muted-foreground px-2 py-2 text-sm">{emptyLabel}</li>
        )}
        {visible.map((item, index) => {
          const Icon = item.icon;
          return (
            <li
              key={item.id}
              role="option"
              aria-selected={item.checked ?? index === active}
              data-id={item.id}
              data-active={index === active}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
              )}
              onMouseMove={(event) => {
                if (reported.current === item.id) return;
                reported.current = item.id;
                setActiveIndex(index);
                onActiveChange?.(item.id, event.currentTarget);
              }}
              onClick={() => onSelect(item.id)}
            >
              {multiple && (
                <Checkbox checked={item.checked} tabIndex={-1} className="pointer-events-none" />
              )}
              {Icon && <Icon className="size-4 shrink-0" />}
              {item.color && (
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              )}
              <span className="flex-1 truncate">{item.label}</span>
              {!multiple && item.checked && <CheckIcon className="size-4 shrink-0" />}
              {item.hasSubmenu && (
                <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
