import { Link } from "@tanstack/react-router";
import type { NextAction } from "@vetra/contracts";

import { WhatsAppIcon } from "@/shared/components/icons/WhatsAppIcon";
import { LeadStageBadge } from "@/shared/components/LeadStageBadge";
import { CompleteActionPopover } from "@/shared/components/next-actions/CompleteActionPopover";
import { ReschedulePopover } from "@/shared/components/next-actions/ReschedulePopover";
import { Button } from "@/shared/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/shared/components/ui/item";
import { cn } from "@/shared/utils/cn";
import { formatDayLabel, formatRelative, formatTime } from "@/shared/utils/date";

type NextActionItemProps = {
  action: NextAction;
  isOverdue?: boolean;
  showLead?: boolean;
};

export function NextActionItem({
  action,
  isOverdue = false,
  showLead = true,
}: NextActionItemProps) {
  const { lead } = action;
  const dueAt = new Date(action.dueAt);

  return (
    <Item variant="outline" size="sm">
      <ItemContent>
        {showLead ? (
          <>
            <ItemTitle>
              <Link to="/leads/$leadId" params={{ leadId: lead.id }} className="hover:underline">
                {lead.businessName}
              </Link>
              <LeadStageBadge stage={lead.stage} />
            </ItemTitle>
            <ItemDescription>
              {action.description} · {lead.niche} · {lead.city}
            </ItemDescription>
          </>
        ) : (
          <>
            <ItemTitle>{action.description}</ItemTitle>
            <ItemDescription>
              {formatDayLabel(dueAt)} · {formatTime(dueAt)}
            </ItemDescription>
          </>
        )}
      </ItemContent>

      {(showLead || isOverdue) && (
        <span
          className={cn(
            "text-xs whitespace-nowrap",
            isOverdue ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {isOverdue ? formatRelative(dueAt) : formatTime(dueAt)}
        </span>
      )}

      <ItemActions>
        {showLead && (
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Abrir conversa no WhatsApp"
            title="Abrir conversa no WhatsApp"
            nativeButton={false}
            render={<Link to="/whatsapp" />}
          >
            <WhatsAppIcon />
          </Button>
        )}
        <ReschedulePopover action={action} />
        <CompleteActionPopover action={action} />
      </ItemActions>
    </Item>
  );
}
