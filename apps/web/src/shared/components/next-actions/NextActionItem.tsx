import { Link } from "@tanstack/react-router";
import type { NextAction } from "@vetra/contracts";
import { MessageSquareTextIcon } from "lucide-react";
import { useState } from "react";

import { WhatsAppIcon } from "@/shared/components/icons/WhatsAppIcon";
import { LeadStageBadge } from "@/shared/components/LeadStageBadge";
import { CompleteActionButton } from "@/shared/components/next-actions/CompleteActionButton";
import { CopyActionTextButton } from "@/shared/components/next-actions/CopyActionTextButton";
import { EditNextActionButton } from "@/shared/components/next-actions/EditNextActionButton";
import { NextActionBody } from "@/shared/components/next-actions/NextActionBody";
import { NextActionSendStatus } from "@/shared/components/next-actions/NextActionSendStatus";
import { SendActionButton } from "@/shared/components/next-actions/SendActionButton";
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
  // In a list the text is hidden, so the row can show it and copy it without opening the editor.
  const [isTextOpen, setIsTextOpen] = useState(false);

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
            render={<Link to="/whatsapp" search={{ leadId: lead.id }} />}
          >
            <WhatsAppIcon />
          </Button>
        )}
        {showLead && action.body && (
          <>
            <CopyActionTextButton body={action.body} />
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={isTextOpen ? "Esconder o texto da mensagem" : "Ver o texto da mensagem"}
              title={isTextOpen ? "Esconder o texto da mensagem" : "Ver o texto da mensagem"}
              aria-expanded={isTextOpen}
              onClick={() => setIsTextOpen((isOpen) => !isOpen)}
            >
              <MessageSquareTextIcon />
            </Button>
          </>
        )}
        <SendActionButton action={action} />
        <EditNextActionButton action={action} />
        <CompleteActionButton action={action} />
      </ItemActions>
      {(!showLead || isTextOpen) && action.body && <NextActionBody body={action.body} />}
      {!showLead && <NextActionSendStatus action={action} />}
    </Item>
  );
}
