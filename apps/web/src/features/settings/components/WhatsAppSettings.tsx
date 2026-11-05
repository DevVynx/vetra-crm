import { Link } from "@tanstack/react-router";
import type { WhatsappConnectionStatus } from "@vetra/contracts";
import { useState } from "react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Button } from "@/shared/components/ui/button";
import { useWhatsappStatus } from "@/shared/queries/whatsapp/useWhatsappStatus";
import { formatPhone } from "@/shared/utils/format";

import { useDisconnectWhatsapp } from "../mutations/useDisconnectWhatsapp";
import { SettingsRow } from "./SettingsRow";
import { SettingsSection } from "./SettingsSection";

function describeConnection(status: WhatsappConnectionStatus | undefined, phone?: string | null) {
  if (status !== "connected") return "Desconectado";

  return phone ? `Conectado em ${formatPhone(phone)}` : "Conectado";
}

export function WhatsAppSettings() {
  const { data, isPending, isError } = useWhatsappStatus();
  const disconnect = useDisconnectWhatsapp();
  const [confirming, setConfirming] = useState(false);

  const status = isError ? undefined : data?.status;
  const isConnected = status === "connected";

  return (
    <SettingsSection title="WhatsApp">
      <SettingsRow
        title="Conexão"
        description={isPending ? undefined : describeConnection(status, data?.phone)}
      >
        {isConnected ? (
          <Button variant="outline" onClick={() => setConfirming(true)}>
            Desconectar
          </Button>
        ) : (
          <Button variant="outline" nativeButton={false} render={<Link to="/whatsapp" />}>
            Conectar
          </Button>
        )}
      </SettingsRow>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Desconectar o WhatsApp?"
        description="As conversas continuam guardadas no Vetra, mas você só poderá enviar mensagens depois de conectar de novo."
        confirmLabel="Desconectar"
        isPending={disconnect.isPending}
        onConfirm={() => disconnect.mutate(undefined, { onSuccess: () => setConfirming(false) })}
      />
    </SettingsSection>
  );
}
