import { ArchiveIcon } from "lucide-react";
import { useState } from "react";

import { SegmentedChoice } from "@/shared/components/SegmentedChoice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useStages } from "@/shared/stages/useStages";

type ArchiveLeadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  isPending?: boolean;
  onConfirm: (archiveStageId: string) => void;
};

export function ArchiveLeadDialog({
  open,
  onOpenChange,
  title,
  description,
  isPending = false,
  onConfirm,
}: ArchiveLeadDialogProps) {
  const { archive } = useStages();
  const [chosenId, setChosenId] = useState<string | null>(null);
  const archiveStageId = archive.find((stage) => stage.id === chosenId)?.id ?? archive[0]?.id ?? "";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <ArchiveIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {archive.length > 1 && (
          <SegmentedChoice
            ariaLabel="Motivo"
            options={archive.map((stage) => ({ value: stage.id, label: stage.name }))}
            value={archiveStageId}
            onChange={setChosenId}
          />
        )}

        <AlertDialogFooter>
          <AlertDialogCancel className="h-10">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="h-10 font-semibold"
            disabled={isPending}
            onClick={() => onConfirm(archiveStageId)}
          >
            Arquivar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
