import { createContext, useContext } from "react";

type DetailPanelContextValue = { open: boolean; toggle: () => void };

export const DetailPanelContext = createContext<DetailPanelContextValue | null>(null);

export function useDetailPanel() {
  const context = useContext(DetailPanelContext);
  if (!context) throw new Error("useDetailPanel must be used inside a SplitDetailLayout");
  return context;
}
