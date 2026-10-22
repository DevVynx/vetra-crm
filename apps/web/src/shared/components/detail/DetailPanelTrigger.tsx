import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

import { useDetailPanel } from "./DetailPanelContext";

// Same icons and size as the trigger of the main sidebar. The ghost variant paints a fixed
// background while aria-expanded is set; here only the hover should.
export function DetailPanelTrigger({ label }: { label: string }) {
  const { open, toggle } = useDetailPanel();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-expanded={open}
      aria-label={`${open ? "Recolher" : "Expandir"} ${label}`}
      title={`${open ? "Recolher" : "Expandir"} ${label}`}
      onClick={toggle}
      className="aria-expanded:bg-transparent aria-expanded:hover:bg-muted dark:aria-expanded:hover:bg-muted/50"
    >
      {open ? <PanelLeftCloseIcon /> : <PanelLeftOpenIcon />}
    </Button>
  );
}
