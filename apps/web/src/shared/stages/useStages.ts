import { useContext } from "react";

import type { StageLookup } from "./stageLookup";
import { StagesContext } from "./StagesContext";

export function useStages(): StageLookup {
  const stages = useContext(StagesContext);
  if (!stages) throw new Error("useStages must be used inside StagesProvider");
  return stages;
}
