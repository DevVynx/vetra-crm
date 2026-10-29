import { CheckIcon, type LucideIcon } from "lucide-react";
import type { FormEventHandler, ReactNode } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

type FormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  submitLabel: string;
  isPending: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
};

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  submitLabel,
  isPending,
  onSubmit,
  children,
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 data-[side=right]:sm:max-w-lg">
        <SheetHeader className="flex-row items-center gap-4 border-b px-6 py-5 pr-14">
          {Icon && (
            <div className="bg-foreground/10 flex size-11 shrink-0 items-center justify-center rounded-lg">
              <Icon className="size-5" />
            </div>
          )}
          <div className="flex min-w-0 flex-col gap-0.5">
            <SheetTitle className="text-2xl font-semibold">{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </div>
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6 **:data-[slot=field-label]:font-semibold **:data-[slot=input]:h-10">
            {children}
          </div>
          <SheetFooter className="bg-muted/30 flex-row justify-end gap-2 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-5"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="h-10 px-5 font-semibold">
              <CheckIcon />
              {submitLabel}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
