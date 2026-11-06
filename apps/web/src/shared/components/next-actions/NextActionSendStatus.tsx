import type { NextAction } from "@vetra/contracts";
import { TriangleAlertIcon, ZapIcon } from "lucide-react";

import { useAutomationSettings } from "@/shared/queries/automations/useAutomationSettings";
import {
  autoSendTimeOf,
  canBeSent,
  failureReasonOf,
  hasMarker,
  MAX_AUTOMATIC_ATTEMPTS,
} from "@/shared/utils/autoSend";
import { formatDayLabel, formatTime } from "@/shared/utils/date";

// What is going to happen with the text of an activity, or why it did not: the time of the automatic
// send, a marker that stops it, or how the last send failed.
export function NextActionSendStatus({ action }: { action: NextAction }) {
  const { data: settings } = useAutomationSettings();
  if (!canBeSent(action)) return null;

  const sendAt = settings ? autoSendTimeOf(action, settings) : null;
  const isOverdue = sendAt !== null && sendAt <= new Date();
  const day = sendAt ? formatDayLabel(sendAt) : null;

  if (action.sendError) {
    const gaveUp =
      action.sendAttempts >= MAX_AUTOMATIC_ATTEMPTS || action.sendError === "interrupted";

    return (
      <p className="text-destructive flex basis-full items-start gap-1.5 text-xs">
        <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
        <span>
          Falha no envio: {failureReasonOf(action.sendError)}.
          {gaveUp && " O envio automático parou: envie pelo botão quando quiser."}
        </span>
      </p>
    );
  }

  if (hasMarker(action.body) && action.lead.autoSend && settings?.autoSendEnabled) {
    return (
      <p className="text-muted-foreground flex basis-full items-start gap-1.5 text-xs">
        <TriangleAlertIcon className="text-warning mt-0.5 size-3.5 shrink-0" />O texto ainda tem
        [SEU WHATSAPP]. Troque pelo seu número: enquanto estiver, o envio automático não envia.
      </p>
    );
  }

  if (!sendAt) return null;

  return (
    <p className="text-muted-foreground flex basis-full items-center gap-1.5 text-xs">
      <ZapIcon className="size-3.5 shrink-0" />
      {isOverdue
        ? "Envio automático em instantes."
        : `Envio automático ${day === "Hoje" ? "" : `${day?.toLowerCase()} `}às ${formatTime(sendAt)}.`}
    </p>
  );
}
