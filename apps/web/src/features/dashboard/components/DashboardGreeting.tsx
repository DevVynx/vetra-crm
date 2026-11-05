import type { DashboardPeriod } from "@vetra/contracts";
import { UserPlusIcon } from "lucide-react";
import { useState } from "react";

import { CreateLeadSheet } from "@/shared/components/leads/CreateLeadSheet";
import { Button } from "@/shared/components/ui/button";
import { useHotkey } from "@/shared/hooks/useHotkey";
import { useProfile } from "@/shared/queries/profile/useProfile";
import { nowInProfileZone } from "@/shared/time-zone/zonedDate";
import { formatLongDate } from "@/shared/utils/date";
import { firstNameOf } from "@/shared/utils/format";

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
  const now = nowInProfileZone();
  const { data: profile } = useProfile();
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  useHotkey("n", () => setIsCreatingLead(true));

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm first-letter:uppercase">
          {formatLongDate(now)}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          {greetingFor(now.getHours())}
          {profile && `, ${firstNameOf(profile.name)}`}
        </h2>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="dark:bg-background font-semibold"
          title="Novo lead (N)"
          onClick={() => setIsCreatingLead(true)}
        >
          <UserPlusIcon />
          Novo lead
        </Button>
        <CreateLeadSheet open={isCreatingLead} onOpenChange={setIsCreatingLead} />
        <PeriodSelect value={period} onChange={onPeriodChange} />
      </div>
    </div>
  );
}
