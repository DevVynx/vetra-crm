import { Link } from "@tanstack/react-router";
import type { WhatsappConversation } from "@vetra/contracts";
import { CircleCheckIcon, MessageCircleIcon } from "lucide-react";

import { ActionsMenu } from "@/shared/components/ActionsMenu";
import { BusinessAvatar } from "@/shared/components/BusinessAvatar";
import { WhatsAppIcon } from "@/shared/components/icons/WhatsAppIcon";
import { Section } from "@/shared/components/Section";
import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { SectionSkeleton } from "@/shared/components/SectionSkeleton";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/shared/components/ui/item";
import {
  conversationName,
  conversationSubtitle,
} from "@/shared/components/whatsapp/conversationName";
import { nonTextMessageLabels } from "@/shared/components/whatsapp/messageTypeLabels";
import { useEndWhatsappConversation } from "@/shared/mutations/whatsapp/useEndWhatsappConversation";
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
  const endConversation = useEndWhatsappConversation();
  const conversations = data?.conversations ?? [];

  return (
    <Section
      title="Conversas esperando você"
      icon={WhatsAppIcon}
      iconClassName="text-success"
      count={data?.total}
    >
      {isPending || isSetUp === undefined ? (
        <SectionSkeleton rows={2} />
      ) : conversations.length === 0 ? (
        <SectionEmpty
          icon={MessageCircleIcon}
          title={isSetUp ? "Nenhuma conversa esperando você" : "WhatsApp não conectado"}
          description={
            isSetUp
              ? "Quando alguém responder, aparece aqui."
              : "Conecte para ver as conversas aqui."
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((conversation) => {
            const name = conversationName(conversation);
            const subtitle = conversationSubtitle(conversation);

            return (
              <Item
                key={conversation.id}
                variant="outline"
                size="sm"
                className="hover:bg-muted focus-within:border-ring relative flex-nowrap items-start"
              >
                <BusinessAvatar
                  name={name}
                  photoUrl={conversation.photoUrl ?? undefined}
                  className="size-9 shrink-0"
                />
                <ItemContent className="min-w-0 gap-0.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <ItemTitle className="min-w-0 flex-1">
                      <Link
                        to="/whatsapp"
                        search={{ conversation: conversation.id }}
                        className="truncate outline-none after:absolute after:inset-0"
                      >
                        {name}
                      </Link>
                    </ItemTitle>
                    {conversation.lastMessageAt && (
                      <span className="text-muted-foreground shrink-0 text-xs whitespace-nowrap">
                        {formatRelative(new Date(conversation.lastMessageAt))}
                      </span>
                    )}
                  </div>
                  {subtitle && (
                    <ItemDescription className="line-clamp-1 text-xs">{subtitle}</ItemDescription>
                  )}
                  <ItemDescription className="line-clamp-1">
                    {lastMessagePreview(conversation)}
                  </ItemDescription>
                </ItemContent>
                <div className="relative z-10 -mt-0.5 -mr-1.5 shrink-0">
                  <ActionsMenu
                    label={`Mais ações da conversa com ${name}`}
                    size="icon-xs"
                    items={[
                      {
                        label: "Encerrar conversa",
                        icon: CircleCheckIcon,
                        onSelect: () => endConversation.mutate(conversation.id),
                      },
                    ]}
                  />
                </div>
              </Item>
            );
          })}
          {data && data.total > conversations.length && (
            <p className="text-muted-foreground text-center text-xs">
              Mostrando as {conversations.length} mais recentes.
            </p>
          )}
        </div>
      )}
    </Section>
  );
}
