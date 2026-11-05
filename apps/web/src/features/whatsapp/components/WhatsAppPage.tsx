import { PagePlaceholder } from "@/shared/components/layout/PagePlaceholder";
import { Spinner } from "@/shared/components/ui/spinner";
import { useWhatsappStatus } from "@/shared/queries/whatsapp/useWhatsappStatus";

import { WhatsAppAccountChange } from "./WhatsAppAccountChange";
import { WhatsAppConnect } from "./WhatsAppConnect";

export function WhatsAppPage() {
  const { data, isPending, isError } = useWhatsappStatus();

  if (isPending) {
    return (
      <div className="flex flex-1 justify-center p-10">
        <Spinner />
      </div>
    );
  }

  if (isError || data?.status !== "connected") {
    return <WhatsAppConnect status={isError ? undefined : data?.status} />;
  }

  if (data.pendingAccountChange) {
    return (
      <WhatsAppAccountChange
        phone={data.phone}
        previousPhone={data.pendingAccountChange.previousPhone}
      />
    );
  }

  return (
    <PagePlaceholder
      description={
        data.importing
          ? "Importando suas conversas. Isso pode levar alguns minutos."
          : "Suas conversas do WhatsApp aparecerão aqui."
      }
    />
  );
}
