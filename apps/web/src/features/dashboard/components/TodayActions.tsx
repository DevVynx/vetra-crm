import type { NextAction } from "@vetra/contracts";
import { ListTodoIcon, PartyPopperIcon } from "lucide-react";

import { cn } from "@/shared/utils/cn";

import { useGroupedNextActions } from "../queries/useGroupedNextActions";
import { DashboardSection } from "./DashboardSection";
import { NextActionItem } from "./NextActionItem";
import { SectionEmpty } from "./SectionEmpty";
import { SectionSkeleton } from "./SectionSkeleton";

type ActionGroupProps = {
  label: string;
  actions: NextAction[];
  isOverdue?: boolean;
};

const SECTION_ICON = { icon: ListTodoIcon, iconClassName: "text-info" };

function ActionGroup({ label, actions, isOverdue }: ActionGroupProps) {
  if (actions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase",
          isOverdue ? "text-destructive" : "text-warning"
        )}
      >
        <span aria-hidden className="size-1.5 rounded-full bg-current" />
        {label} · {actions.length}
      </h3>
      {actions.map((action) => (
        <NextActionItem key={action.id} action={action} isOverdue={isOverdue} />
      ))}
    </div>
  );
}

export function TodayActions() {
  const { data, isPending } = useGroupedNextActions();

  if (isPending || !data) {
    return (
      <DashboardSection title="Ações do dia" {...SECTION_ICON}>
        <SectionSkeleton rows={4} />
      </DashboardSection>
    );
  }

  const { overdue, today } = data;
  const total = overdue.length + today.length;

  return (
    <DashboardSection title="Ações do dia" count={total} {...SECTION_ICON}>
      {total === 0 ? (
        <SectionEmpty
          icon={PartyPopperIcon}
          title="Tudo em dia"
          description="Nenhuma ação atrasada ou para hoje."
        />
      ) : (
        <div className="flex flex-col gap-5">
          <ActionGroup label="Atrasadas" actions={overdue} isOverdue />
          <ActionGroup label="Hoje" actions={today} />
        </div>
      )}
    </DashboardSection>
  );
}
