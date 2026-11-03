import { createContext } from "react";

import type { StageLookup } from "./stageLookup";

export const StagesContext = createContext<StageLookup | null>(null);
