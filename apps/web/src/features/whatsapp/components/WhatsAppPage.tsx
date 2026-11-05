import { useState } from "react";

import { Spinner } from "@/shared/components/ui/spinner";
import { useWhatsappConversationCount } from "@/shared/queries/whatsapp/useWhatsappConversationCount";
import { useWhatsappStatus } from "@/shared/queries/whatsapp/useWhatsappStatus";

import { WhatsAppAccountChange } from "./WhatsAppAccountChange";
import { WhatsAppConnect } from "./WhatsAppConnect";
import { WhatsAppInbox } from "./WhatsAppInbox";

export function WhatsAppPage() {
  const { data, isPending, isError } = useWhatsappStatus();
  const conversationCount = useWhatsappConversationCount();
  const [wantsToConnect, setWantsToConnect] = useState(false);

  if (isPending || conversationCount.isPending) {
    return (
      <div className="flex flex-1 justify-center p-10">
        <Spinner />
      </div>
    );
  }

  const status = isError ? undefined : data?.status;

  if (status === "connected") {
    if (data?.pendingAccountChange) {
      return (
        <WhatsAppAccountChange
          phone={data.phone}
          previousPhone={data.pendingAccountChange.previousPhone}
        />
      );
    }

    return (
      <WhatsAppInbox
        isConnected
        isImporting={Boolean(data?.importing)}
        onConnect={() => undefined}
      />
    );
  }

  const hasConversations = (conversationCount.data?.count ?? 0) > 0;
  const isConnecting = status === "connecting" || status === "awaiting_qr";

  if (hasConversations && !wantsToConnect && !isConnecting) {
    return (
      <WhatsAppInbox
        isConnected={false}
        isImporting={false}
        onConnect={() => setWantsToConnect(true)}
      />
    );
  }

  return (
    <WhatsAppConnect
      status={status}
      onBack={hasConversations ? () => setWantsToConnect(false) : undefined}
    />
  );
}
