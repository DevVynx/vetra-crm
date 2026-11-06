import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/shared/utils/cn";

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer focus-visible:ring-ring/50 data-checked:bg-primary data-unchecked:bg-input inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="bg-background pointer-events-none block size-4 rounded-full ring-0 transition-transform data-checked:translate-x-[17px] data-unchecked:translate-x-px"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
