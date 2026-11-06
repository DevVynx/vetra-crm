import { Link } from "@tanstack/react-router";
import { PROFILE_NAME_MAX_LENGTH } from "@vetra/contracts";
import { useState } from "react";

import { ProfilePhotoField } from "@/shared/components/profile/ProfilePhotoField";
import { TimeZoneField } from "@/shared/components/profile/TimeZoneField";
import { buttonVariants } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useUpdateProfile } from "@/shared/mutations/profile/useUpdateProfile";
import { useProfile } from "@/shared/queries/profile/useProfile";

import { SettingsRow } from "./SettingsRow";
import { SettingsSection } from "./SettingsSection";

type NameFieldProps = {
  savedName: string;
};

function NameField({ savedName }: NameFieldProps) {
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState(savedName);

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return setName(savedName);
    if (trimmed !== savedName) updateProfile.mutate({ name: trimmed });
  };

  return (
    <Input
      aria-label="Nome"
      className="w-56"
      maxLength={PROFILE_NAME_MAX_LENGTH}
      value={name}
      onChange={(event) => setName(event.target.value)}
      onBlur={save}
      onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
    />
  );
}

function TimeZoneSetting({ savedTimeZone }: { savedTimeZone: string }) {
  const updateProfile = useUpdateProfile();

  return (
    <TimeZoneField
      timeZone={savedTimeZone}
      onSelect={(timeZone) => updateProfile.mutate({ timeZone })}
    />
  );
}

export function ProfileSettings() {
  const { data: profile } = useProfile();

  return (
    <SettingsSection title="Perfil">
      <SettingsRow title="Nome" description="Usado na saudação do Painel.">
        {profile && <NameField key={profile.name} savedName={profile.name} />}
      </SettingsRow>
      <SettingsRow
        title="Foto"
        description="Aparece nos registros dos clientes e nos áudios que você envia no WhatsApp."
      >
        <ProfilePhotoField />
      </SettingsRow>
      <SettingsRow title="Fuso horário" description="Usado nas datas e nos períodos do Painel.">
        {profile && <TimeZoneSetting savedTimeZone={profile.timeZone} />}
      </SettingsRow>
      <SettingsRow
        title="Introdução"
        description="As boas-vindas que aparecem no primeiro acesso, para rever e ajustar o nome e o fuso."
      >
        <Link to="/welcome" className={buttonVariants({ variant: "outline" })}>
          Rever
        </Link>
      </SettingsRow>
    </SettingsSection>
  );
}
