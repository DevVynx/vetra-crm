import { useState } from "react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Button } from "@/shared/components/ui/button";
import { useAutomationLeads } from "@/shared/queries/automations/useAutomationLeads";
import { pluralize } from "@/shared/utils/format";

import { useSetAutomationLeads } from "../mutations/useSetAutomationLeads";
import { SettingsRow } from "./SettingsRow";

// Turns the sending on or off for every lead at once. It says first how many leads that is and, for
// turning it on, how many texts already due would go at once.
export function AutoSendAllLeadsRow() {
  const { data: counts } = useAutomationLeads();
  const setAll = useSetAutomationLeads();
  const [pending, setPending] = useState<"on" | "off" | null>(null);

  if (!counts) return null;

  const toTurnOn = counts.total - counts.withSending;
  const toTurnOff = counts.withSending;
  const reached = pending === "on" ? toTurnOn : toTurnOff;

  const confirm = () => {
    if (!pending) return;

    setAll.mutate({ autoSend: pending === "on" }, { onSettled: () => setPending(null) });
  };

  return (
    <>
      <SettingsRow
        title="Todos os leads"
        description={`${counts.withSending} de ${pluralize(counts.total, "lead", "leads")} com envio automático ligado. Clientes, leads arquivados e quem pediu para não ser contatado ficam de fora.`}
      >
        <div className="flex gap-2">
          <Button variant="outline" disabled={toTurnOn === 0} onClick={() => setPending("on")}>
            Ligar em todos
          </Button>
          <Button variant="outline" disabled={toTurnOff === 0} onClick={() => setPending("off")}>
            Desligar em todos
          </Button>
        </div>
      </SettingsRow>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title={`${pending === "on" ? "Ligar" : "Desligar"} o envio automático em ${pluralize(reached, "lead", "leads")}?`}
        description={
          pending === "on"
            ? "O Vetra passa a enviar sozinho o texto das atividades desses leads."
            : "O Vetra deixa de enviar sozinho para eles. Você ainda pode enviar pelo botão de cada atividade."
        }
        confirmLabel={pending === "on" ? "Ligar" : "Desligar"}
        isPending={setAll.isPending}
        onConfirm={confirm}
      >
        {pending === "on" && counts.dueTexts > 0 && (
          <p className="bg-warning/10 text-warning rounded-lg border px-3 py-2 text-sm font-medium">
            {pluralize(
              counts.dueTexts,
              "atividade com texto já vencida",
              "atividades com texto já vencidas"
            )}{" "}
            {counts.dueTexts === 1 ? "será enviada" : "serão enviadas"} em instantes.
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}
