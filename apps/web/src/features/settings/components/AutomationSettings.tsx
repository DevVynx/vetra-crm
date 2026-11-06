import { TriangleAlertIcon } from "lucide-react";
import { useState } from "react";

import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { useAutomationSettings } from "@/shared/queries/automations/useAutomationSettings";
import { useStages } from "@/shared/stages/useStages";

import { useUpdateAutomationSettings } from "../mutations/useUpdateAutomationSettings";
import { AutoSendAllLeadsRow } from "./AutoSendAllLeadsRow";
import { SettingsRow } from "./SettingsRow";
import { SettingsSection } from "./SettingsSection";
import { StageAutomationRow } from "./StageAutomationRow";

const MAX_DELAY_MINUTES = 1440;
const MAX_UNANSWERED_DAYS = 3650;
const MAX_FOLLOW_UPS = 3;

export function AutomationSettings() {
  const { data: settings } = useAutomationSettings();
  const update = useUpdateAutomationSettings();
  const stages = useStages();
  const [delay, setDelay] = useState<string | null>(null);
  const [days, setDays] = useState<string | null>(null);
  const [limit, setLimit] = useState<string | null>(null);
  const [waits, setWaits] = useState<Record<number, string>>({});

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

  const shownDays = days ?? String(settings.archiveUnansweredDays);

  const saveDays = () => {
    const value = Number(shownDays);
    const isValid = Number.isInteger(value) && value >= 1 && value <= MAX_UNANSWERED_DAYS;
    setDays(null);

    if (isValid && value !== settings.archiveUnansweredDays) {
      update.mutate({ ...settings, archiveUnansweredDays: value });
    }
  };

  const shownLimit = limit ?? String(settings.followUpLimit);

  const saveLimit = () => {
    const value = Number(shownLimit);
    const isValid = Number.isInteger(value) && value >= 0 && value <= MAX_FOLLOW_UPS;
    setLimit(null);

    if (isValid && value !== settings.followUpLimit) {
      update.mutate({ ...settings, followUpLimit: value });
    }
  };

  const saveWait = (index: number) => {
    const value = Number(waits[index]);
    const isValid = Number.isInteger(value) && value >= 0 && value <= MAX_UNANSWERED_DAYS;
    setWaits((current) =>
      Object.fromEntries(Object.entries(current).filter(([key]) => Number(key) !== index))
    );

    if (isValid && value !== settings.followUpWaitDays[index]) {
      const followUpWaitDays = settings.followUpWaitDays.map((current, i) =>
        i === index ? value : current
      );
      update.mutate({ ...settings, followUpWaitDays });
    }
  };

  // Every lead starts at the entry stage, so moving to it means nothing: only the middle stages are offered.
  const middleStageIds = stages.middle.map((stage) => stage.id);
  const archiveStageIds = stages.archive.map((stage) => stage.id);

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
          <SettingsRow
            title="Follow-ups da pipeline"
            description="Recomendamos só 1 follow-up, por causa do risco de bloqueio do número. O máximo é 3, para a sua segurança."
          >
            <div className="flex items-center gap-2">
              <Input
                aria-label="Quantidade de follow-ups"
                type="number"
                min={0}
                max={MAX_FOLLOW_UPS}
                className="h-9 w-20 text-right"
                value={shownLimit}
                onChange={(event) => setLimit(event.target.value)}
                onBlur={saveLimit}
                onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
              />
            </div>
          </SettingsRow>
          {settings.followUpLimit > 0 && (
            <SettingsRow
              title="Espera dos follow-ups da pipeline"
              description="Dias até cada follow-up, contados do envio da mensagem anterior. O Vetra cria o seguinte quando o anterior é enviado ou concluído."
            >
              <div className="flex items-center gap-3">
                {settings.followUpWaitDays.slice(0, settings.followUpLimit).map((wait, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <span className="text-muted-foreground text-sm">{index + 1}º</span>
                    <Input
                      aria-label={`Dias até o follow-up ${index + 1}`}
                      type="number"
                      min={0}
                      max={MAX_UNANSWERED_DAYS}
                      className="h-9 w-16 text-right"
                      value={waits[index] ?? String(wait)}
                      onChange={(event) =>
                        setWaits((current) => ({ ...current, [index]: event.target.value }))
                      }
                      onBlur={() => saveWait(index)}
                      onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
                    />
                  </div>
                ))}
                <span className="text-muted-foreground text-sm">dias</span>
              </div>
            </SettingsRow>
          )}
          <StageAutomationRow
            title="Mover ao enviar a primeira mensagem"
            description="Quando o Vetra envia o texto de um lead que ainda está na primeira etapa, ele vai para a etapa escolhida."
            isEnabled={settings.moveOnSendEnabled}
            stageId={settings.moveOnSendStageId}
            stageIds={middleStageIds}
            isPending={update.isPending}
            onEnabledChange={(checked) =>
              update.mutate({ ...settings, moveOnSendEnabled: checked })
            }
            onStageChange={(id) => update.mutate({ ...settings, moveOnSendStageId: id })}
          />
          <StageAutomationRow
            title="Mover quando o lead responder"
            description="Quando chega uma mensagem do lead, ele vai para a etapa escolhida. Nunca volta para uma etapa anterior."
            isEnabled={settings.moveOnReplyEnabled}
            stageId={settings.moveOnReplyStageId}
            stageIds={middleStageIds}
            isPending={update.isPending}
            onEnabledChange={(checked) =>
              update.mutate({ ...settings, moveOnReplyEnabled: checked })
            }
            onStageChange={(id) => update.mutate({ ...settings, moveOnReplyStageId: id })}
          />
          <SettingsRow
            title="Cancelar follow-ups quando o lead responder"
            description="Os follow-ups ainda pendentes do lead são apagados assim que ele responde."
          >
            <Switch
              aria-label="Cancelar follow-ups quando o lead responder"
              checked={settings.cancelFollowUpsOnReply}
              disabled={update.isPending}
              onCheckedChange={(checked) =>
                update.mutate({ ...settings, cancelFollowUpsOnReply: checked })
              }
            />
          </SettingsRow>
          <StageAutomationRow
            title="Arquivar quem não responde"
            description="Depois desses dias sem resposta a partir do último texto enviado, e sem follow-up pendente, o lead é arquivado na etapa escolhida."
            isEnabled={settings.archiveUnansweredEnabled}
            stageId={settings.archiveUnansweredStageId}
            stageIds={archiveStageIds}
            isPending={update.isPending}
            onEnabledChange={(checked) =>
              update.mutate({ ...settings, archiveUnansweredEnabled: checked })
            }
            onStageChange={(id) => update.mutate({ ...settings, archiveUnansweredStageId: id })}
          >
            <div className="flex items-center gap-2">
              <Input
                aria-label="Dias sem resposta"
                type="number"
                min={1}
                max={MAX_UNANSWERED_DAYS}
                className="h-9 w-20 text-right"
                value={shownDays}
                onChange={(event) => setDays(event.target.value)}
                onBlur={saveDays}
                onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
              />
              <span className="text-muted-foreground text-sm">dias</span>
            </div>
          </StageAutomationRow>
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
