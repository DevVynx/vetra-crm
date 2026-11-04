import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import type { SortController } from "./useSortController";

const directions = [
  { value: "asc", label: "Crescente", icon: ArrowUpIcon },
  { value: "desc", label: "Decrescente", icon: ArrowDownIcon },
] as const;

export function SortButton<TField extends string>({
  controller,
}: {
  controller: SortController<TField>;
}) {
  const { options, active, activeOption, isDefault, isOpen, setIsOpen } = controller;
  const ActiveDirectionIcon = active.direction === "asc" ? ArrowUpIcon : ArrowDownIcon;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="dark:bg-background font-semibold"
            title="Ordenar (O)"
          >
            <ArrowUpDownIcon />
            {isDefault ? "Ordenar" : `Ordenar: ${activeOption?.label}`}
            {!isDefault && <ActiveDirectionIcon />}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={active.field} onValueChange={controller.selectField}>
            {options.map(({ id, label, icon: Icon }) => (
              <DropdownMenuRadioItem key={id} value={id}>
                <Icon />
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Direção</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={active.direction}
            onValueChange={controller.selectDirection}
          >
            {directions.map(({ value, label, icon: Icon }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon />
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        {!isDefault && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={controller.restoreDefault}>
              <RotateCcwIcon />
              Restaurar padrão
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
