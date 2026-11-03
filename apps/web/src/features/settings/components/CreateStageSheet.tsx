import type { StageRole } from "@vetra/contracts";
import { STAGE_NAME_MAX_LENGTH } from "@vetra/contracts";
import { MilestoneIcon } from "lucide-react";
import { useState } from "react";

import { FormSheet } from "@/shared/components/FormSheet";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { stageColorPresets } from "@/shared/constants/stageColors";
import { useCreateStage } from "@/shared/mutations/stages/useCreateStage";

import { StageColorField } from "./StageColorField";

type CreateStageSheetProps = {
  role: Extract<StageRole, "middle" | "archive">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DEFAULT_COLOR = stageColorPresets[1];

export function CreateStageSheet({ role, open, onOpenChange }: CreateStageSheetProps) {
  const createStage = useCreateStage();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(DEFAULT_COLOR);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setName("");
      setColor(DEFAULT_COLOR);
    }
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createStage.mutate(
      { name: trimmed, color, role },
      { onSuccess: () => handleOpenChange(false) }
    );
  };

  return (
    <FormSheet
      icon={MilestoneIcon}
      open={open}
      onOpenChange={handleOpenChange}
      title={role === "archive" ? "Nova etapa de arquivamento" : "Nova etapa do lead"}
      description={
        role === "archive"
          ? "Leads arquivados ficam fora do funil."
          : "A etapa entra antes do fechamento."
      }
      submitLabel="Criar etapa"
      isPending={createStage.isPending}
      onSubmit={submit}
    >
      <Field>
        <FieldLabel htmlFor="stage-name">Nome</FieldLabel>
        <Input
          id="stage-name"
          autoFocus
          placeholder={role === "archive" ? "Ex.: Sem fit" : "Ex.: Em negociação"}
          maxLength={STAGE_NAME_MAX_LENGTH}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel>Cor</FieldLabel>
        <StageColorField value={color} onChange={setColor} />
      </Field>
    </FormSheet>
  );
}
