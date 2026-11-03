import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import type * as React from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import { cn } from "@/shared/utils/cn";

const Combobox = ComboboxPrimitive.Root;

function ComboboxTrigger({ className, children, ...props }: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4" />
    </ComboboxPrimitive.Trigger>
  );
}

function ComboboxInput({
  className,
  disabled = false,
  anchorRef,
  startAddon,
  ...props
}: ComboboxPrimitive.Input.Props & {
  anchorRef?: React.Ref<HTMLDivElement>;
  startAddon?: React.ReactNode;
}) {
  return (
    <InputGroup ref={anchorRef} className={cn("w-auto", className)}>
      {startAddon && <InputGroupAddon align="inline-start">{startAddon}</InputGroupAddon>}
      <ComboboxPrimitive.Input render={<InputGroupInput disabled={disabled} />} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          variant="ghost"
          render={<ComboboxTrigger />}
          data-slot="input-group-button"
          className="data-pressed:bg-transparent"
          disabled={disabled}
        />
      </InputGroupAddon>
    </InputGroup>
  );
}

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        anchor={anchor}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(
            "group/combobox-content bg-popover text-popover-foreground ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) overflow-hidden rounded-lg shadow-md ring-1 duration-100",
            className
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "max-h-[min(--spacing(72),var(--available-height))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
        className
      )}
      {...props}
    />
  );
}

function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "text-muted-foreground hidden w-full justify-center py-2 text-center text-sm group-data-empty/combobox-content:flex",
        className
      )}
      {...props}
    />
  );
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group data-slot="combobox-group" className={cn(className)} {...props} />
  );
}

function ComboboxLabel({ className, ...props }: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  );
}

function ComboboxCollection(props: ComboboxPrimitive.Collection.Props) {
  return <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />;
}

export {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
};
