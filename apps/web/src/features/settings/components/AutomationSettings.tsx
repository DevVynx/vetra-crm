import { TriangleAlertIcon } from "lucide-react";
import { useState } from "react";

import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { useAutomationSettings } from "@/shared/queries/automations/useAutomationSettings";

import { useUpdateAutomationSettings } from "../mutations/useUpdateAutomationSettings";
import { AutoSendAllLeadsRow } from "./AutoSendAllLeadsRow";
import { SettingsRow } from "./SettingsRow";
import { SettingsSection } from "./SettingsSection";

const MAX_DELAY_MINUTES = 1440;

export function AutomationSettings() {
  const { data: settings } = useAutomationSettings();
  const update = useUpdateAutomationSettings();
  const [delay, setDelay] = useState<string | null>(null);

  if (!settings) return null;

  const shownDelay = delay ?? String(settings.autoSendDelayMinutes);

  const saveDelay = () => {
    const minutes = Number(shownDelay);
    const isValid = Number.isInteger(minutes) && minutes >= 0 && minutes <= MAX_DELAY_MINUTES;
    setDelay(null);

    if (isValid && minutes !== settings.autoSendDelayMinutes) {
      update.mutate({ ...settings, autoSendDelayMinutes: minutes });
    }
  };

  return (
    <SettingsSection
      title="Automações"
      description="O Vetra pode enviar sozinho o texto de uma atividade. Cada lead tem o seu próprio interruptor de envio automático."
    >
      <SettingsRow
        title="Envio automático"
        description="Chave geral. Desligada, nada é enviado sozinho, qualquer que seja o lead."
      >
        <Switch
          aria-label="Envio automático"
          checked={settings.autoSendEnabled}
          disabled={update.isPending}
          onCheckedChange={(checked) => update.mutate({ ...settings, autoSendEnabled: checked })}
        />
      </SettingsRow>
      {settings.autoSendEnabled && (
        <>
          <SettingsRow
            title="Esperar antes de enviar"
            description="Minutos entre a atividade ser criada e o Vetra enviá-la. 0 envia assim que possível."
          >
            <div className="flex items-center gap-2">
              <Input
                aria-label="Minutos de espera"
                type="number"
                min={0}
                max={MAX_DELAY_MINUTES}
                className="h-9 w-20 text-right"
                value={shownDelay}
                onChange={(event) => setDelay(event.target.value)}
                onBlur={saveDelay}
                onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
              />
              <span className="text-muted-foreground text-sm">min</span>
            </div>
          </SettingsRow>
          <SettingsRow
            title="Novos leads começam com envio automático"
            description="Vale para quem você cadastra, importa ou chega pela pipeline. Cada lead pode ser mudado depois."
          >
            <Switch
              aria-label="Novos leads começam com envio automático"
              checked={settings.newLeadsAutoSend}
              disabled={update.isPending}
              onCheckedChange={(checked) =>
                update.mutate({ ...settings, newLeadsAutoSend: checked })
              }
            />
          </SettingsRow>
          <AutoSendAllLeadsRow />
        </>
      )}
      {/* Always shown: it is what the user needs to read before turning the sending on. */}
      <div className="text-muted-foreground flex gap-3 px-5 py-3.5 text-xs">
        <TriangleAlertIcon className="text-warning mt-0.5 size-4 shrink-0" />
        <p>
          Enviar mensagens por automação pode fazer o WhatsApp bloquear o número, porque a conexão
          não é oficial. Recomendamos enviar poucas mensagens por dia e com pausas. O Vetra não
          impõe limite nenhum: a decisão é sua.
        </p>
      </div>
    </SettingsSection>
  );
}
