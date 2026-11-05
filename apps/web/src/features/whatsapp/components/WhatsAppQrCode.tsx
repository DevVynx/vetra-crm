import { Skeleton } from "@/shared/components/ui/skeleton";

import { useWhatsappQrCode } from "../queries/useWhatsappQrCode";

export function WhatsAppQrCode() {
  const { data } = useWhatsappQrCode();

  if (!data) return <Skeleton className="size-64 rounded-lg" />;

  return (
    <img
      src={data.image}
      alt="QR Code para conectar o WhatsApp"
      className="size-64 rounded-lg border"
    />
  );
}
