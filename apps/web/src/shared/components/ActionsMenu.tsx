import { type LucideIcon, MoreHorizontalIcon } from "lucide-react";
import { Fragment } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export type ActionsMenuItem = {
  label: string;
  icon: LucideIcon;
  onSelect?: () => void;
  destructive?: boolean;
};

type ActionsMenuProps = {
  label: string;
  size?: "icon-xs" | "icon-sm";
  items: ActionsMenuItem[];
};

export function ActionsMenu({ label, items, size = "icon-sm" }: ActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size={size} variant="ghost" aria-label={label} title={label}>
            <MoreHorizontalIcon />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {item.destructive && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              disabled={!item.onSelect}
              variant={item.destructive ? "destructive" : "default"}
              onClick={item.onSelect}
            >
              <item.icon />
              {item.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
