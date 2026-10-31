import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

type PageCrumbContextValue = { crumb: string | null; setCrumb: (crumb: string | null) => void };

const PageCrumbContext = createContext<PageCrumbContextValue | null>(null);

export function PageCrumbProvider({ children }: { children: ReactNode }) {
  const [crumb, setCrumb] = useState<string | null>(null);
  return (
    <PageCrumbContext.Provider value={{ crumb, setCrumb }}>{children}</PageCrumbContext.Provider>
  );
}

export function useCurrentCrumb() {
  return useContext(PageCrumbContext)?.crumb ?? null;
}

export function usePageCrumb(label: string | undefined) {
  const setCrumb = useContext(PageCrumbContext)?.setCrumb;

  useEffect(() => {
    setCrumb?.(label ?? null);
    return () => setCrumb?.(null);
  }, [label, setCrumb]);
}
