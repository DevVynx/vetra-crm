import { Button } from "@/shared/components/ui/button";
import { useCheckForUpdates, useUpdateInfo } from "@/shared/queries/updates/useUpdateInfo";

import { SettingsRow } from "./SettingsRow";
import { SettingsSection } from "./SettingsSection";

export function UpdateSettings() {
  const { data: info } = useUpdateInfo();
  const check = useCheckForUpdates();

  if (!info) return null;

  const status = !info.canCheck
    ? "Esta é uma versão de desenvolvimento, sem verificação de atualizações."
    : info.checkFailed
      ? "Não foi possível verificar agora. Confira a internet e tente de novo."
      : info.hasUpdate
        ? `A versão ${info.latestVersion} está disponível.`
        : "Você está na versão mais recente.";

  return (
    <SettingsSection title="Atualizações">
      <SettingsRow title="Versão instalada" description={status}>
        <span className="text-sm font-medium tabular-nums">
          {info.canCheck ? info.currentVersion : "Desenvolvimento"}
        </span>
      </SettingsRow>
      {info.hasUpdate && (
        <div className="flex flex-col gap-2 px-5 py-3.5 text-xs">
          <p className="text-muted-foreground">
            Para atualizar, feche esta aba, abra a pasta <strong>scripts</strong> do Vetra e dê
            duplo clique em <strong>atualizar-vetra-windows.bat</strong> (no macOS e no Linux, rode
            o <code>atualizar-vetra-mac-linux.sh</code>). Antes de trocar, o Vetra guarda um backup
            do banco na pasta <strong>backups</strong>, e, se a versão nova não iniciar, volta
            sozinho à anterior.
          </p>
          {info.releaseUrl && (
            <a
              href={info.releaseUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary w-fit underline underline-offset-4"
            >
              Ver as novidades da versão {info.latestVersion}
            </a>
          )}
        </div>
      )}
      {info.canCheck && (
        <div className="flex justify-end px-5 py-3">
          <Button variant="outline" disabled={check.isPending} onClick={() => check.mutate()}>
            {check.isPending ? "Verificando..." : "Verificar agora"}
          </Button>
        </div>
      )}
    </SettingsSection>
  );
}
