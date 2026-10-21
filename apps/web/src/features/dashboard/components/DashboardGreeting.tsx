import { Link } from "@tanstack/react-router";
import type { DashboardPeriod } from "@vetra/contracts";
import { BoxIcon, MessageSquarePlusIcon, UserPlusIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { formatLongDate } from "@/shared/utils/date";

import { mockProfile } from "../mocks/fixtures";
import { PeriodSelect } from "./PeriodSelect";

function greetingFor(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

type DashboardGreetingProps = {
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
};

export function DashboardGreeting({ period, onPeriodChange }: DashboardGreetingProps) {
  const now = new Date();

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm first-letter:uppercase">
          {formatLongDate(now)}
        </p>
        <h2 className="text-2xl font-medium tracking-tight">
          {greetingFor(now.getHours())}, {mockProfile.firstName}
        </h2>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" nativeButton={false} render={<Link to="/leads" />}>
          <UserPlusIcon />
          Novo lead
        </Button>
        <Button className="bg-info text-info-foreground hover:bg-info/85">
          <BoxIcon />
          Novo projeto
        </Button>
        <Button variant="outline" disabled title="Disponível no detalhe do lead">
          <MessageSquarePlusIcon />
          Registrar interação
        </Button>
        <PeriodSelect value={period} onChange={onPeriodChange} />
      </div>
    </div>
  );
}
