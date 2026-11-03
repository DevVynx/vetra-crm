import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";

import { StageColorField } from "./StageColorField";

type StageColorPopoverProps = {
  color: string;
  notice?: string;
  onCommit: (color: string) => void;
};

export function StageColorPopover({ color, notice, onCommit }: StageColorPopoverProps) {
  const [draft, setDraft] = useState(color);

  const handleOpenChange = (open: boolean) => {
    if (open) return setDraft(color);
    if (draft !== color) onCommit(draft);
  };

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={<Button size="icon-sm" variant="ghost" aria-label="Alterar cor da etapa" />}
      >
        <span className="size-4 rounded-full" style={{ backgroundColor: color }} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 gap-3">
        {notice && <p className="text-muted-foreground text-xs">{notice}</p>}
        <StageColorField value={draft} onChange={setDraft} />
      </PopoverContent>
    </Popover>
  );
}
