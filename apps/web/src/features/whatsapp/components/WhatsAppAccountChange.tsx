import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { formatPhone } from "@/shared/utils/format";

import { useResolveWhatsappAccountChange } from "../mutations/useResolveWhatsappAccountChange";

type WhatsAppAccountChangeProps = {
  phone: string | null;
  previousPhone: string;
};

export function WhatsAppAccountChange({ phone, previousPhone }: WhatsAppAccountChangeProps) {
  const resolve = useResolveWhatsappAccountChange();
  const previous = formatPhone(previousPhone);

  return (
    <ConfirmDialog
      open
      ignoreEscape
      onOpenChange={(open) => {
        if (!open) resolve.mutate({ decision: "cancel" });
      }}
      title="Este é outro número"
      description={`Você conectou ${phone ? formatPhone(phone) : "um número diferente"}, mas as conversas guardadas são de ${previous}. Para usar este número, as conversas antigas serão apagadas do Vetra para sempre. Se cancelar, este número será desconectado e nada será apagado.`}
      confirmLabel="Apagar e importar"
      destructive
      isPending={resolve.isPending}
      onConfirm={() => resolve.mutate({ decision: "replace" })}
    />
  );
}
