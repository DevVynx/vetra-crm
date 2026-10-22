import { CheckIcon, XIcon } from "lucide-react";
import { type KeyboardEvent, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/utils/cn";

const NOTE_MAX_LENGTH = 2000;

type NoteEditorProps = {
  initialContent?: string;
  placeholder?: string;
  isPending: boolean;
  onSave: (content: string) => void;
  onCancel: () => void;
};

// Enter saves and Shift+Enter breaks the line; Escape discards. Leaving the editor closes it only
// when there is nothing to lose, so typed text is never dropped by a stray click.
export function NoteEditor({
  initialContent = "",
  placeholder,
  isPending,
  onSave,
  onCancel,
}: NoteEditorProps) {
  const [content, setContent] = useState(initialContent);
  const trimmed = content.trim();
  const canSave = trimmed.length > 0 && !isPending;
  const isUnchanged = trimmed === initialContent.trim();

  const save = () => {
    if (canSave) onSave(trimmed);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      save();
    } else if (event.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div
      className="flex items-center gap-1.5"
      onBlur={(event) => {
        if (isUnchanged && !event.currentTarget.contains(event.relatedTarget)) onCancel();
      }}
    >
      <Textarea
        autoFocus
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={(event) => event.currentTarget.setSelectionRange(content.length, content.length)}
        maxLength={NOTE_MAX_LENGTH}
        placeholder={placeholder}
        aria-label="Texto da nota"
        className={cn(
          "min-h-9 flex-1 py-1.5 focus-visible:ring-0",
          isUnchanged ? "focus-visible:border-input" : "border-ring focus-visible:border-ring"
        )}
      />
      <div className="flex gap-1.5">
        <Button
          type="button"
          size="icon-sm"
          aria-label="Salvar nota"
          title="Salvar (Enter)"
          disabled={!canSave}
          onClick={save}
        >
          <CheckIcon />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Cancelar"
          title="Cancelar (Esc)"
          onClick={onCancel}
        >
          <XIcon />
        </Button>
      </div>
    </div>
  );
}
