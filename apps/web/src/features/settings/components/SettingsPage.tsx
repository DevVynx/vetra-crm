import { DataSettings } from "./DataSettings";
import { ProfileSettings } from "./ProfileSettings";
import { StagesSettings } from "./StagesSettings";
import { WhatsAppSettings } from "./WhatsAppSettings";

export function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
      <ProfileSettings />
      <StagesSettings />
      <WhatsAppSettings />
      <DataSettings />
    </div>
  );
}
