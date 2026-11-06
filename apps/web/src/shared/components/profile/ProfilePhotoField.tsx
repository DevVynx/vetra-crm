import { type ChangeEvent, useRef } from "react";
import { toast } from "sonner";

import { BusinessAvatar } from "@/shared/components/BusinessAvatar";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { useRemoveProfilePhoto } from "@/shared/mutations/profile/useRemoveProfilePhoto";
import { useSaveProfilePhoto } from "@/shared/mutations/profile/useSaveProfilePhoto";
import { useProfile } from "@/shared/queries/profile/useProfile";
import { useProfilePhotoUrl } from "@/shared/queries/profile/useProfilePhotoUrl";
import { toProfilePhoto } from "@/shared/utils/toProfilePhoto";

// The initials follow the name typed, when there is one, instead of the saved one.
export function ProfilePhotoField({ name }: { name?: string }) {
  const { data: profile } = useProfile();
  const photoUrl = useProfilePhotoUrl();
  const save = useSaveProfilePhoto();
  const remove = useRemoveProfilePhoto();
  const inputRef = useRef<HTMLInputElement>(null);
  const isPending = save.isPending || remove.isPending;

  const choose = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return void toast.error("Escolha um arquivo de imagem.");

    try {
      save.mutate(await toProfilePhoto(file));
    } catch {
      toast.error("Não foi possível usar essa imagem. Tente outra.");
    }
  };

  return (
    <div className="flex items-center gap-3">
      <BusinessAvatar
        name={name ?? profile?.name ?? ""}
        photoUrl={photoUrl}
        className="size-10 text-sm"
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label="Foto de perfil"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => void choose(event)}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
      >
        {save.isPending && <Spinner />}
        {photoUrl ? "Trocar foto" : "Escolher foto"}
      </Button>
      {photoUrl && (
        <Button variant="ghost" size="sm" disabled={isPending} onClick={() => remove.mutate()}>
          Remover
        </Button>
      )}
    </div>
  );
}
