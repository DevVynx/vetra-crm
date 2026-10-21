import type { DashboardPeriod } from "@vetra/contracts";
import { useState } from "react";

import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

import { usePendingCount } from "../queries/usePendingCount";
import { AwaitingConversations } from "./AwaitingConversations";
import { DashboardGreeting } from "./DashboardGreeting";
import { KpiStrip } from "./KpiStrip";
import { LeadsWithoutNextAction } from "./LeadsWithoutNextAction";
import { RevenueChart } from "./RevenueChart";
import { SalesFunnel } from "./SalesFunnel";
import { TodayActions } from "./TodayActions";

const DEFAULT_PERIOD: DashboardPeriod = "month";
const PANEL_GRID = "grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]";

export function DashboardPage() {
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const pendingCount = usePendingCount();

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardGreeting period={period} onPeriodChange={setPeriod} />
      <KpiStrip period={period} />

      <Tabs defaultValue="operation" className="gap-4">
        <TabsList>
          <TabsTrigger value="operation" className="px-3">
            Operação
            {!!pendingCount && <Badge variant="secondary">{pendingCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="performance" className="px-3">
            Desempenho
          </TabsTrigger>
        </TabsList>

        <TabsContent value="operation" className={PANEL_GRID}>
          <TodayActions />
          <aside className="flex flex-col gap-6">
            <AwaitingConversations />
            <LeadsWithoutNextAction />
          </aside>
        </TabsContent>

        <TabsContent value="performance" className={PANEL_GRID}>
          <RevenueChart period={period} />
          <SalesFunnel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
