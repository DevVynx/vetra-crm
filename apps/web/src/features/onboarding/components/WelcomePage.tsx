import { useNavigate } from "@tanstack/react-router";
import type { GetProfileResponse } from "@vetra/contracts";
import { PROFILE_NAME_MAX_LENGTH } from "@vetra/contracts";
import { useState } from "react";

import vetraIcon from "@/shared/assets/vetra-icon.svg";
import { ConnectionLostNotice } from "@/shared/components/layout/ConnectionLostNotice";
import { ProfilePhotoField } from "@/shared/components/profile/ProfilePhotoField";
import { TimeZoneField } from "@/shared/components/profile/TimeZoneField";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import { useConnectionStore } from "@/shared/connection/connectionStore";
import { useCompleteOnboarding } from "@/shared/mutations/profile/useCompleteOnboarding";
import { useProfile } from "@/shared/queries/profile/useProfile";
import { suggestedTimeZoneOf } from "@/shared/utils/timeZoneOptions";

const STEPS = 2;

function WelcomeSteps({ profile }: { profile: GetProfileResponse }) {
  const navigate = useNavigate();
  const completeOnboarding = useCompleteOnboarding();
  const [step, setStep] = useState(1);
  // The first time, the name starts empty (the saved one is a placeholder) and the zone is the
  // browser's. Seeing it again starts from what is saved.
  const [name, setName] = useState(profile.isOnboarded ? profile.name : "");
  const [timeZone, setTimeZone] = useState(
    profile.isOnboarded ? profile.timeZone : suggestedTimeZoneOf(profile.timeZone)
  );
  const hasName = name.trim().length > 0;

  const finish = () =>
    completeOnboarding.mutate(
      { name: name.trim(), timeZone },
      { onSuccess: () => void navigate({ to: "/" }) }
    );

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md gap-6 p-8">
        <div className="flex items-center justify-between">
          <img src={vetraIcon} alt="" className="h-8 w-auto" />
          <span className="text-muted-foreground text-xs">
            Passo {step} de {STEPS}
          </span>
        </div>

        {step === 1 ? (
          <form
            className="flex flex-col gap-6"
            onSubmit={(event) => {
              event.preventDefault();
              if (hasName) setStep(2);
            }}
          >
            <div className="flex flex-col gap-1.5">
              <h1 className="text-xl font-semibold tracking-tight">Bem-vindo ao Vetra</h1>
              <p className="text-muted-foreground text-sm">
                Seu CRM pessoal para organizar leads e clientes, e que roda só no seu computador.
                Antes de começar, duas coisas rápidas.
              </p>
            </div>
            <Field>
              <FieldLabel htmlFor="welcome-name">Como você se chama?</FieldLabel>
              <Input
                id="welcome-name"
                autoFocus
                maxLength={PROFILE_NAME_MAX_LENGTH}
                placeholder="Seu nome"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <FieldDescription>Aparece na saudação do Painel.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Foto (opcional)</FieldLabel>
              <ProfilePhotoField name={name} />
            </Field>
            <Button type="submit" disabled={!hasName}>
              Continuar
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-xl font-semibold tracking-tight">Qual é o seu fuso horário?</h1>
              <p className="text-muted-foreground text-sm">
                Ele define o que é "hoje" no Painel e as datas dos vencimentos. Escolhemos o do seu
                navegador: confirme ou troque.
              </p>
            </div>
            <TimeZoneField timeZone={timeZone} onSelect={setTimeZone} className="w-full" />
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={completeOnboarding.isPending}
                onClick={() => setStep(1)}
              >
                Voltar
              </Button>
              <Button className="flex-1" disabled={completeOnboarding.isPending} onClick={finish}>
                {completeOnboarding.isPending && <Spinner />}
                Começar
              </Button>
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}

// Outside the layout of the app: no menu, and always reachable, so it can be seen again.
export function WelcomePage() {
  const { data: profile } = useProfile();
  const isConnectionLost = useConnectionStore((state) => state.isLost);

  if (isConnectionLost) return <ConnectionLostNotice />;
  if (!profile) return null;

  // No key on the profile: saving flips isOnboarded, and a remount here would drop the navigation
  // that follows the save. The steps read what they start from once, when they appear.
  return <WelcomeSteps profile={profile} />;
}
