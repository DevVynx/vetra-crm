import { create } from "zustand";

type SearchPaletteState = {
  isOpen: boolean;
};

// The palette is mounted once in the app shell and opened from unrelated places (header, sidebar).
export const useSearchPaletteStore = create<SearchPaletteState>(() => ({ isOpen: false }));

export const setSearchPaletteOpen = (isOpen: boolean) => useSearchPaletteStore.setState({ isOpen });

export const toggleSearchPalette = () =>
  useSearchPaletteStore.setState((state) => ({ isOpen: !state.isOpen }));
