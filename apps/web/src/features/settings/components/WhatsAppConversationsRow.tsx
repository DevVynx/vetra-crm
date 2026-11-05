import { useState } from "react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Button } from "@/shared/components/ui/button";

import { useDeleteWhatsappConversations } from "../mutations/useDeleteWhatsappConversations";
import { useWhatsappConversationCount } from "../queries/useWhatsappConversationCount";
import { SettingsRow } from "./SettingsRow";

const describeCount = (count: number) =>
  count === 1 ? "1 conversa guardada no Vetra" : `${count} conversas guardadas no Vetra`;

export function WhatsAppConversationsRow({ isConnected }: { isConnected: boolean }) {
  const { data } = useWhatsappConversationCount();
  const deleteConversations = useDeleteWhatsappConversations();
  const [confirming, setConfirming] = useState(false);

  if (!data?.count) return null;

  return (
    <SettingsRow
      title="Conversas"
      description={
        isConnected
          ? `${describeCount(data.count)}. Desconecte para poder apagar.`
          : describeCount(data.count)
      }
    >
      <Button variant="outline" disabled={isConnected} onClick={() => setConfirming(true)}>
        Apagar conversas
      </Button>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Apagar todas as conversas?"
        description="As conversas e mensagens guardadas no Vetra serão apagadas para sempre. Nada muda no seu celular, e se você conectar de novo o histórico será importado outra vez."
        confirmLabel="Apagar conversas"
        destructive
        isPending={deleteConversations.isPending}
        onConfirm={() =>
          deleteConversations.mutate(undefined, { onSuccess: () => setConfirming(false) })
        }
      />
    </SettingsRow>
  );
}
