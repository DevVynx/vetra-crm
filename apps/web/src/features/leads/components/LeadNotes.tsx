import { PlusIcon, StickyNoteIcon } from "lucide-react";
import { useState } from "react";

import { Section } from "@/shared/components/Section";
import { SectionSkeleton } from "@/shared/components/SectionSkeleton";
import { Button } from "@/shared/components/ui/button";

import { useCreateLeadNote } from "../mutations/useCreateLeadNote";
import { useDeleteLeadNote } from "../mutations/useDeleteLeadNote";
import { useUpdateLeadNote } from "../mutations/useUpdateLeadNote";
import { useLeadNotes } from "../queries/useLeadNotes";
import { NoteEditor } from "./NoteEditor";
import { NoteItem } from "./NoteItem";

export function LeadNotes({ leadId }: { leadId: string }) {
  const { data, isPending } = useLeadNotes(leadId);
  const createNote = useCreateLeadNote(leadId);
  const { saveNote, isPending: isSaving } = useUpdateLeadNote(leadId);
  const deleteNote = useDeleteLeadNote(leadId);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const notes = data?.notes ?? [];

  const startAdding = () => {
    setEditingId(null);
    setIsAdding(true);
  };

  const startEditing = (noteId: string) => {
    setIsAdding(false);
    setEditingId(noteId);
  };

  return (
    <Section
      title="Notas"
      icon={StickyNoteIcon}
      iconClassName="text-chart-3"
      count={data ? notes.length : undefined}
      action={
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label="Adicionar nota"
          title="Adicionar nota"
          onClick={startAdding}
        >
          <PlusIcon />
        </Button>
      }
    >
      <div className="flex [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] flex-col gap-2 lg:min-h-0 lg:overflow-y-auto">
        {isAdding && (
          <NoteEditor
            placeholder="Escreva uma nota sobre este lead…"
            isPending={createNote.isPending}
            onSave={(content) =>
              createNote.mutate({ content }, { onSuccess: () => setIsAdding(false) })
            }
            onCancel={() => setIsAdding(false)}
          />
        )}

        {isPending ? (
          <SectionSkeleton rows={2} />
        ) : notes.length === 0 && !isAdding ? (
          <p className="text-muted-foreground text-sm">Nenhuma nota ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isEditing={editingId === note.id}
                isSaving={isSaving}
                onEdit={() => startEditing(note.id)}
                onCancelEdit={() => setEditingId(null)}
                onSave={(content) => saveNote(note, content, () => setEditingId(null))}
                onDelete={() => deleteNote.mutate(note)}
              />
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
