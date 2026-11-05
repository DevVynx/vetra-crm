import { Link } from "@tanstack/react-router";
import type { WhatsappConnectionStatus } from "@vetra/contracts";
import { ArrowLeftIcon, InfoIcon } from "lucide-react";
import type { ReactNode } from "react";

import { WhatsAppIcon } from "@/shared/components/icons/WhatsAppIcon";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { WhatsAppQrArea } from "./WhatsAppQrArea";

const Term = ({ children }: { children: ReactNode }) => (
  <strong className="text-foreground font-medium">{children}</strong>
);

const STEPS: ReactNode[] = [
  "Abra o WhatsApp no seu celular",
  <>
    Toque em <Term>Mais opções</Term> no Android ou em <Term>Configurações</Term> no iPhone
  </>,
  <>
    Toque em <Term>Dispositivos conectados</Term> e depois em <Term>Conectar dispositivo</Term>
  </>,
  "Aponte a câmera para o QR Code",
];

type WhatsAppConnectProps = {
  status: WhatsappConnectionStatus | undefined;
  onBack?: (() => void) | undefined;
};

export function WhatsAppConnect({ status, onBack }: WhatsAppConnectProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 p-4 md:p-6">
      {onBack && (
        <div className="w-full max-w-3xl">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeftIcon />
            Voltar para as conversas
          </Button>
        </div>
      )}
      <Card className="w-full max-w-3xl gap-0 py-0">
        <div className="flex flex-col gap-8 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-success/10 text-success flex size-10 shrink-0 items-center justify-center rounded-lg">
                <WhatsAppIcon size={22} />
              </div>
              <div className="flex flex-col gap-0.5">
                <h1 className="text-xl font-semibold tracking-tight">Conecte seu WhatsApp</h1>
                <p className="text-muted-foreground text-sm">
                  Converse com seus leads e clientes sem sair do Vetra.
                </p>
              </div>
            </div>

            <ol className="flex flex-col gap-3">
              {STEPS.map((step, index) => (
                <li key={index} className="text-muted-foreground flex gap-3 text-sm">
                  <span className="text-foreground flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <p className="text-muted-foreground text-xs">
              Você pode desconectar o WhatsApp quando quiser em{" "}
              <Link to="/settings" className="text-foreground font-medium hover:underline">
                Configurações
              </Link>
              .
            </p>
          </div>

          <div className="flex shrink-0 justify-center">
            <WhatsAppQrArea status={status} />
          </div>
        </div>

        <div className="bg-muted/30 flex gap-3 border-t p-4 md:px-8">
          <InfoIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
          <div className="flex flex-col gap-1">
            <h2 className="text-xs font-medium">Antes de conectar</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Esta conexão não é oficial do WhatsApp, então existe algum risco de bloqueio do
              número. Em um número que já está em uso, recomendamos até 20 abordagens e 10
              follow-ups por dia. Em um número novo, espere alguns meses antes de começar e evite
              automatizar. Mesmo seguindo essas recomendações, não conseguimos garantir que o número
              não será bloqueado e não nos responsabilizamos caso isso aconteça.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
