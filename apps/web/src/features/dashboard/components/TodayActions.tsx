import type { NextAction } from "@vetra/contracts";
import { ListTodoIcon, PartyPopperIcon } from "lucide-react";

import { NextActionItem } from "@/shared/components/next-actions/NextActionItem";
import { Section } from "@/shared/components/Section";
import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { SectionSkeleton } from "@/shared/components/SectionSkeleton";
import { cn } from "@/shared/utils/cn";

import { SCROLL_COLUMN } from "../constants/scrollColumn";
import { useGroupedNextActions } from "../queries/useGroupedNextActions";

type ActionGroupProps = {
  label: string;
  actions: NextAction[];
  isOverdue?: boolean;
};

const SECTION_PROPS = { icon: ListTodoIcon, iconClassName: "text-info" };

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
      <div className={SCROLL_COLUMN}>
        <Section title="Ações do dia" {...SECTION_PROPS}>
          <SectionSkeleton rows={4} />
        </Section>
      </div>
    );
  }

  const { overdue, today } = data;
  const total = overdue.length + today.length;

  return (
    <div className={SCROLL_COLUMN}>
      <Section title="Ações do dia" count={total} {...SECTION_PROPS}>
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
      </Section>
    </div>
  );
}
