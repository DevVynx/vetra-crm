import type { WhatsappConnectionStatus } from "@vetra/contracts";
import { QrCodeIcon, ServerOffIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";

import { useConnectWhatsapp } from "../mutations/useConnectWhatsapp";
import { WhatsAppQrCode } from "./WhatsAppQrCode";

const QrFrame = ({ children }: { children: ReactNode }) => (
  <div className="bg-background/50 flex size-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center">
    {children}
  </div>
);

type WhatsAppQrAreaProps = {
  status: WhatsappConnectionStatus | undefined;
};

export function WhatsAppQrArea({ status }: WhatsAppQrAreaProps) {
  const connect = useConnectWhatsapp();

  if (status === "awaiting_qr") return <WhatsAppQrCode />;

  if (status === undefined || status === "unavailable") {
    return (
      <QrFrame>
        <ServerOffIcon className="text-muted-foreground size-6" />
        <p className="text-sm font-medium">Serviço do WhatsApp indisponível</p>
        <p className="text-muted-foreground text-xs">
          Verifique se o Docker está rodando e aguarde alguns segundos.
        </p>
      </QrFrame>
    );
  }

  if (status === "connecting" || connect.isPending) {
    return (
      <QrFrame>
        <Spinner />
        <p className="text-muted-foreground text-sm">Preparando a conexão…</p>
      </QrFrame>
    );
  }

  return (
    <QrFrame>
      <QrCodeIcon className="text-muted-foreground size-8" />
      <Button className="font-semibold" onClick={() => connect.mutate()}>
        Gerar QR Code
      </Button>
    </QrFrame>
  );
}
