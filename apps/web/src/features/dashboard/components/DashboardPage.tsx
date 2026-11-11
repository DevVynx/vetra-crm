import type { DashboardPeriod } from "@vetra/contracts";
import { useState } from "react";

import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/utils/cn";

import { SCROLL_COLUMN } from "../constants/scrollColumn";
import { usePendingCount } from "../queries/usePendingCount";
import { AwaitingConversations } from "./AwaitingConversations";
import { ConversionByNicheChart } from "./ConversionByNicheChart";
import { DashboardGreeting } from "./DashboardGreeting";
import { KpiStrip } from "./KpiStrip";
import { LeadsWithoutNextAction } from "./LeadsWithoutNextAction";
import { ProspectingChart } from "./ProspectingChart";
import { RevenueChart } from "./RevenueChart";
import { SalesFunnel } from "./SalesFunnel";
import { TodayActions } from "./TodayActions";

const DEFAULT_PERIOD: DashboardPeriod = "month";
const PANEL_GRID = "grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]";
const OPERATION_GRID =
  "grid gap-6 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_26rem] lg:grid-rows-[minmax(0,1fr)]";
// On Operação the page does not scroll: each column scrolls inside itself, down to this height,
// below which the page scrolls as usual.
const OPERATION_MIN_HEIGHT = "lg:h-full lg:min-h-[48rem]";

export function DashboardPage() {
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const [tab, setTab] = useState("operation");
  const pendingCount = usePendingCount();

  return (
    <div className={cn("flex flex-col gap-6 p-6", tab === "operation" && OPERATION_MIN_HEIGHT)}>
      <DashboardGreeting period={period} onPeriodChange={setPeriod} />
      <KpiStrip period={period} />

      <Tabs value={tab} onValueChange={setTab} className="min-h-0 flex-1 gap-4">
        <TabsList>
          <TabsTrigger value="operation" className="px-3">
            Operação
            {!!pendingCount && <Badge variant="secondary">{pendingCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="performance" className="px-3">
            Desempenho
          </TabsTrigger>
        </TabsList>

        <TabsContent value="operation" className={cn(OPERATION_GRID, "items-start")}>
          <TodayActions />
          <aside className={cn("flex flex-col gap-6", SCROLL_COLUMN)}>
            <AwaitingConversations />
            <LeadsWithoutNextAction />
          </aside>
        </TabsContent>

        <TabsContent value="performance" className="flex flex-col gap-6">
          <div className={PANEL_GRID}>
            <RevenueChart period={period} />
            <SalesFunnel period={period} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <ProspectingChart period={period} />
            <ConversionByNicheChart period={period} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
