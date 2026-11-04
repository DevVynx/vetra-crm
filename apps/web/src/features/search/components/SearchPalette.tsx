import { useEffect } from "react";

import { CommandDialog } from "@/shared/components/ui/command";
import {
  setSearchPaletteOpen,
  toggleSearchPalette,
  useSearchPaletteStore,
} from "@/shared/search/searchPaletteStore";

import { SearchPaletteContent } from "./SearchPaletteContent";

export function SearchPalette() {
  const isOpen = useSearchPaletteStore((state) => state.isOpen);

  // Not useHotkey: it ignores Ctrl combinations and typing targets, and this must work over both.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.ctrlKey || event.metaKey)) return;
      if (event.altKey || event.shiftKey) return;
      event.preventDefault();
      toggleSearchPalette();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={setSearchPaletteOpen}
      title="Buscar"
      description="Busque leads, clientes, projetos, notas e próximas ações, ou vá para uma página."
      className="top-[15svh] flex translate-y-0 flex-col gap-0 max-sm:top-0 max-sm:left-0 max-sm:h-svh max-sm:max-w-none max-sm:translate-x-0 max-sm:rounded-none sm:max-w-2xl"
    >
      <SearchPaletteContent />
    </CommandDialog>
  );
}
