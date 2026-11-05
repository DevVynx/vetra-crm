import { Link } from "@tanstack/react-router";
import { BellRingIcon, ClockIcon, MessageCircleIcon } from "lucide-react";
import type { ReactNode } from "react";

import { WhatsAppIcon } from "@/shared/components/icons/WhatsAppIcon";
import { Section } from "@/shared/components/Section";
import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { SectionSkeleton } from "@/shared/components/SectionSkeleton";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { MessageBubble } from "@/shared/components/whatsapp/MessageBubble";
import { useIsWhatsappSetUp } from "@/shared/queries/whatsapp/useIsWhatsappSetUp";
import { cn } from "@/shared/utils/cn";

import { useLeadConversation } from "../queries/useLeadConversation";
import { conversationStateOf } from "../utils/conversationState";

type CardLinkProps = {
  search: { conversation?: string; leadId?: string };
  children: ReactNode;
};

function CardLink({ search, children }: CardLinkProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      nativeButton={false}
      render={<Link to="/whatsapp" search={search} />}
    >
      {children}
    </Button>
  );
}

export function LeadConversation({ leadId }: { leadId: string }) {
  const isSetUp = useIsWhatsappSetUp();
  const isLoading = isSetUp === undefined;
  const { data, isPending } = useLeadConversation(leadId);
  const conversation = data?.conversation ?? null;
  const state = conversation ? conversationStateOf(conversation) : null;

  return (
    <Section
      title="Conversa"
      icon={WhatsAppIcon}
      iconClassName="text-success"
      action={
        isPending || isLoading ? null : conversation ? (
          <CardLink search={{ conversation: conversation.id }}>Abrir conversa</CardLink>
        ) : isSetUp ? (
          <CardLink search={{ leadId }}>Enviar mensagem</CardLink>
        ) : (
          <CardLink search={{}}>Conectar</CardLink>
        )
      }
    >
      {isPending || isLoading ? (
        <SectionSkeleton rows={2} />
      ) : !conversation || !state ? (
        <SectionEmpty
          icon={MessageCircleIcon}
          title={isSetUp ? "Nenhuma conversa ainda" : "WhatsApp não conectado"}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div
            className={cn(
              "flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold",
              state.awaiting === "you"
                ? "border-warning/40 bg-warning/10 text-warning"
                : "border-primary/30 bg-primary/10 text-primary"
            )}
          >
            {state.awaiting === "you" ? (
              <BellRingIcon className="size-4" />
            ) : (
              <ClockIcon className="size-4" />
            )}
            {state.waitingText}
            {conversation.unreadCount > 0 && (
              <Badge>
                {conversation.unreadCount}{" "}
                {conversation.unreadCount === 1 ? "não lida" : "não lidas"}
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {conversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} compact />
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
