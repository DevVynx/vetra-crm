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
import { leadStageLabels } from "@/shared/constants/leadStages";

export type ArchiveReason = "no_response" | "lost";

const reasons: ArchiveReason[] = ["no_response", "lost"];

type ArchiveLeadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  isPending?: boolean;
  onConfirm: (reason: ArchiveReason) => void;
};

export function ArchiveLeadDialog({
  open,
  onOpenChange,
  title,
  description,
  isPending = false,
  onConfirm,
}: ArchiveLeadDialogProps) {
  const [reason, setReason] = useState<ArchiveReason>("no_response");

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

        <SegmentedChoice
          ariaLabel="Motivo"
          options={reasons.map((value) => ({ value, label: leadStageLabels[value] }))}
          value={reason}
          onChange={setReason}
        />

        <AlertDialogFooter>
          <AlertDialogCancel className="h-10">Cancelar</AlertDialogCancel>
          <AlertDialogAction className="h-10 font-semibold" disabled={isPending} onClick={() => onConfirm(reason)}>
            Arquivar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
