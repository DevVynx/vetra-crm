import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";

const COPIED_FEEDBACK_IN_MS = 1500;

type CopyablePropertyProps = {
  value: string;
  copyLabel: string;
  displayValue?: string;
};

export function CopyableProperty({ value, copyLabel, displayValue }: CopyablePropertyProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_FEEDBACK_IN_MS);
  };

  return (
    <div className="flex items-center gap-1">
      <span className="min-w-0 tabular-nums">{displayValue ?? value}</span>
      <Button
        size="icon-xs"
        variant="ghost"
        className="-my-0.5"
        aria-label={copyLabel}
        title={copyLabel}
        onClick={copy}
      >
        {copied ? <CheckIcon className="text-success" /> : <CopyIcon />}
      </Button>
    </div>
  );
}
