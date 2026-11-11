import { getRouteApi, Link } from "@tanstack/react-router";
import type { WhatsappConversation } from "@vetra/contracts";
import { CircleCheckIcon, UserPlusIcon, UserRoundIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { ActionsMenu } from "@/shared/components/ActionsMenu";
import { CreateLeadSheet } from "@/shared/components/leads/CreateLeadSheet";
import { Button } from "@/shared/components/ui/button";
import { useEndWhatsappConversation } from "@/shared/mutations/whatsapp/useEndWhatsappConversation";
import { formatPhone } from "@/shared/utils/format";
import { maskPhone } from "@/shared/utils/masks";

import { ConversationStageMenu } from "./ConversationStageMenu";

const route = getRouteApi("/_app/whatsapp");

function TurnIntoLead({ conversation }: { conversation: WhatsappConversation }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button size="sm" variant="outline" title="Tornar lead" onClick={() => setIsOpen(true)}>
        <UserPlusIcon />
        <span className="hidden sm:inline">Tornar lead</span>
      </Button>
      <CreateLeadSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        initialValues={{
          contactName: conversation.savedName ?? conversation.contactName ?? "",
          // Through formatPhone so the form shows the ninth digit, which the WhatsApp id may not carry.
          phone: conversation.phone ? maskPhone(formatPhone(conversation.phone)) : "",
        }}
      />
    </>
  );
}

function ContactLink({ lead }: { lead: NonNullable<WhatsappConversation["lead"]> }) {
  const label = lead.isCustomer ? "Ver cliente" : "Ver lead";
  const link = lead.isCustomer ? (
    <Link to="/customers/$customerId" params={{ customerId: lead.id }} />
  ) : (
    <Link to="/leads/$leadId" params={{ leadId: lead.id }} />
  );

  return (
    <Button size="sm" variant="outline" title={label} nativeButton={false} render={link}>
      <UserRoundIcon />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

export function ConversationActions({ conversation }: { conversation: WhatsappConversation }) {
  const navigate = route.useNavigate();
  const { lead } = conversation;
  const endConversation = useEndWhatsappConversation();

  return (
    <div className="flex shrink-0 items-center gap-2">
      {!lead && <TurnIntoLead conversation={conversation} />}
      {lead && !lead.isCustomer && <ConversationStageMenu lead={lead} />}
      {lead && <ContactLink lead={lead} />}
      <ActionsMenu
        label="Mais ações da conversa"
        items={[
          ...(conversation.isAwaitingYou
            ? [
                {
                  label: "Encerrar conversa",
                  icon: CircleCheckIcon,
                  onSelect: () => endConversation.mutate(conversation.id),
                },
              ]
            : []),
          {
            label: "Fechar conversa",
            icon: XIcon,
            onSelect: () => void navigate({ search: {} }),
          },
        ]}
      />
    </div>
  );
}
