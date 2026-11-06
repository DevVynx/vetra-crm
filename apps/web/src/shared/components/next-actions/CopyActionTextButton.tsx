import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";

const COPIED_FEEDBACK_IN_MS = 1500;

// A small button that copies the text of an activity, for the lists where the text is not shown.
export function CopyActionTextButton({ body }: { body: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_FEEDBACK_IN_MS);
    } catch {
      toast.error("Não foi possível copiar o texto.");
    }
  };

  return (
    <Button
      size="icon-sm"
      variant="ghost"
      aria-label="Copiar o texto da mensagem"
      title="Copiar o texto da mensagem"
      onClick={copy}
    >
      {copied ? <CheckIcon className="text-success" /> : <CopyIcon />}
    </Button>
  );
}
