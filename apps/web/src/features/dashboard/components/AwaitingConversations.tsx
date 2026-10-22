import { Link } from "@tanstack/react-router";
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
import { formatRelative } from "@/shared/utils/date";

import { useAwaitingConversations } from "../queries/useAwaitingConversations";

export function AwaitingConversations() {
  const { data, isPending } = useAwaitingConversations();
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
        <SectionEmpty icon={MessageCircleIcon} title="Nenhuma conversa esperando resposta" />
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((conversation) => (
            <Item
              key={conversation.id}
              variant="outline"
              size="sm"
              render={<Link to="/whatsapp" />}
            >
              <ItemMedia variant="icon">
                <WhatsAppIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {conversation.contactName}
                  {conversation.lead && (
                    <span className="text-muted-foreground font-normal">
                      · {conversation.lead.businessName}
                    </span>
                  )}
                </ItemTitle>
                <ItemDescription className="line-clamp-1">
                  {conversation.lastMessagePreview}
                </ItemDescription>
              </ItemContent>
              <span className="text-muted-foreground self-start text-xs whitespace-nowrap">
                {formatRelative(new Date(conversation.lastMessageAt))}
              </span>
            </Item>
          ))}
        </div>
      )}
    </Section>
  );
}
