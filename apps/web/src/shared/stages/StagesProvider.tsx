import { type ReactNode, useMemo } from "react";

import { useStagesQuery } from "@/shared/queries/stages/useStagesQuery";

import { buildStageLookup } from "./stageLookup";
import { StagesContext } from "./StagesContext";

export function StagesProvider({ children }: { children: ReactNode }) {
  const { data } = useStagesQuery();
  const lookup = useMemo(() => (data ? buildStageLookup(data.stages) : null), [data]);

  if (!lookup) return null;

  return <StagesContext.Provider value={lookup}>{children}</StagesContext.Provider>;
}
