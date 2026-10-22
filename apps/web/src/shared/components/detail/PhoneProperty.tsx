import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

import { WhatsAppIcon } from "@/shared/components/icons/WhatsAppIcon";
import { Button } from "@/shared/components/ui/button";
import { formatPhone } from "@/shared/utils/format";

const COPIED_FEEDBACK_IN_MS = 1500;

export function PhoneProperty({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_FEEDBACK_IN_MS);
  };

  return (
    <div className="flex items-center gap-1">
      <span className="tabular-nums">{formatPhone(phone)}</span>
      <Button
        size="icon-xs"
        variant="ghost"
        aria-label="Abrir conversa no WhatsApp"
        title="Abrir conversa no WhatsApp"
        nativeButton={false}
        render={<a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" />}
      >
        <WhatsAppIcon />
      </Button>
      <Button
        size="icon-xs"
        variant="ghost"
        aria-label="Copiar telefone"
        title="Copiar telefone"
        onClick={copy}
      >
        {copied ? <CheckIcon className="text-success" /> : <CopyIcon />}
      </Button>
    </div>
  );
}
