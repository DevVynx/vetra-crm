import { StagesSettings } from "./StagesSettings";

export function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
      <StagesSettings />
    </div>
  );
}
