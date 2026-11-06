import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";

const COPIED_FEEDBACK_IN_MS = 1500;

// The text to use when doing the action (a message to send), whole and with its line breaks.
export function NextActionBody({ body }: { body: string }) {
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
    <div className="bg-background/60 flex basis-full flex-col gap-2 rounded-md border p-3">
      <p className="max-h-60 overflow-y-auto text-sm break-words whitespace-pre-wrap">{body}</p>
      <Button size="xs" variant="outline" className="self-start" onClick={copy}>
        {copied ? <CheckIcon className="text-success" /> : <CopyIcon />}
        {copied ? "Copiado" : "Copiar texto"}
      </Button>
    </div>
  );
}
