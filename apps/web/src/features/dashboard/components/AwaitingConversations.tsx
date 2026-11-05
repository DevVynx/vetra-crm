import { Link } from "@tanstack/react-router";
import type { WhatsappConversation } from "@vetra/contracts";
import { MessageCircleIcon } from "lucide-react";

import { WhatsAppIcon } from "@/shared/components/icons/WhatsAppIcon";
import { Section } from "@/shared/components/Section";
import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { SectionSkeleton } from "@/shared/components/SectionSkeleton";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/shared/components/ui/item";
import { conversationName } from "@/shared/components/whatsapp/conversationName";
import { nonTextMessageLabels } from "@/shared/components/whatsapp/messageTypeLabels";
import { useIsWhatsappSetUp } from "@/shared/queries/whatsapp/useIsWhatsappSetUp";
import { formatRelative } from "@/shared/utils/date";

import { useAwaitingConversations } from "../queries/useAwaitingConversations";

function lastMessagePreview({ lastMessage }: WhatsappConversation) {
  if (!lastMessage) return "";
  if (lastMessage.isDeleted) return "Mensagem apagada";
  if (lastMessage.content) return lastMessage.content;

  return lastMessage.type === "text" ? "" : nonTextMessageLabels[lastMessage.type].label;
}

export function AwaitingConversations() {
  const { data, isPending } = useAwaitingConversations();
  const isSetUp = useIsWhatsappSetUp();
  const conversations = data?.conversations ?? [];

  return (
    <Section
      title="Conversas esperando você"
      icon={WhatsAppIcon}
      iconClassName="text-success"
      count={data ? conversations.length : undefined}
    >
      {isPending ? (
        <SectionSkeleton rows={2} />
      ) : conversations.length === 0 ? (
        <SectionEmpty
          icon={MessageCircleIcon}
          title={isSetUp ? "Nenhuma conversa esperando você" : "WhatsApp não conectado"}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((conversation) => (
            <Item
              key={conversation.id}
              variant="outline"
              size="sm"
              render={<Link to="/whatsapp" search={{ conversation: conversation.id }} />}
            >
              <ItemMedia variant="icon">
                <WhatsAppIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {conversationName(conversation)}
                  {conversation.lead?.contactName && (
                    <span className="text-muted-foreground font-normal">
                      · {conversation.lead.businessName}
                    </span>
                  )}
                </ItemTitle>
                <ItemDescription className="line-clamp-1">
                  {lastMessagePreview(conversation)}
                </ItemDescription>
              </ItemContent>
              {conversation.lastMessageAt && (
                <span className="text-muted-foreground self-start text-xs whitespace-nowrap">
                  {formatRelative(new Date(conversation.lastMessageAt))}
                </span>
              )}
            </Item>
          ))}
        </div>
      )}
    </Section>
  );
}
