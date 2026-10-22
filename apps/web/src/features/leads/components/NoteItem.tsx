import type { LeadNote } from "@vetra/contracts";
import { PencilIcon, Trash2Icon } from "lucide-react";

import { ActionsMenu } from "@/shared/components/ActionsMenu";
import { formatRelative, formatShortDate } from "@/shared/utils/date";

import { NoteEditor } from "./NoteEditor";

type NoteItemProps = {
  note: LeadNote;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: (content: string) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
};

export function NoteItem({
  note,
  isEditing,
  isSaving,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
}: NoteItemProps) {
  if (isEditing) {
    return (
      <li className="rounded-lg border p-2">
        <NoteEditor
          initialContent={note.content}
          isPending={isSaving}
          onSave={onSave}
          onCancel={onCancelEdit}
        />
      </li>
    );
  }

  return (
    <li className="flex items-start gap-2 rounded-lg border p-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm break-words whitespace-pre-wrap">{note.content}</p>
        <p
          className="text-muted-foreground mt-1.5 text-xs"
          title={formatShortDate(new Date(note.createdAt))}
        >
          {formatRelative(new Date(note.createdAt))}
        </p>
      </div>
      <ActionsMenu
        label="Ações da nota"
        size="icon-xs"
        items={[
          { label: "Editar", icon: PencilIcon, onSelect: onEdit },
          { label: "Excluir", icon: Trash2Icon, destructive: true, onSelect: onDelete },
        ]}
      />
    </li>
  );
}
