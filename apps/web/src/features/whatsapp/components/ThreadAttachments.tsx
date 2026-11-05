import { WHATSAPP_MAX_FILES_AT_ONCE, WHATSAPP_MEDIA_MAX_BYTES } from "@vetra/contracts";
import { PaperclipIcon } from "lucide-react";
import {
  type ClipboardEvent as ReactClipboardEvent,
  createContext,
  type DragEvent,
  type ReactNode,
  useContext,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { FileUpload } from "@/shared/components/ui/file-upload";

import { useSendWhatsappMedia } from "../mutations/useSendWhatsappMedia";

type ThreadAttachmentsValue = {
  files: File[];
  captionOf: (file: File) => string;
  setCaption: (file: File, caption: string) => void;
  isSending: boolean;
  send: () => Promise<boolean>;
  clear: () => void;
};

const ThreadAttachmentsContext = createContext<ThreadAttachmentsValue | null>(null);

export function useThreadAttachments(): ThreadAttachmentsValue {
  const value = useContext(ThreadAttachmentsContext);
  if (!value) throw new Error("useThreadAttachments must be used inside ThreadAttachments");

  return value;
}

// Only an image and a video take a caption, the same rule the API applies.
const CAPTION_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4"];
export const takesCaption = (file: File) => CAPTION_TYPES.includes(file.type);

const MAX_MEGABYTES = WHATSAPP_MEDIA_MAX_BYTES / (1024 * 1024);

// The component refuses files with English messages; the person reads them in Portuguese.
function rejectionText(file: File, message: string): string {
  if (message === "File too large") return `"${file.name}" passa do limite de ${MAX_MEGABYTES} MB.`;
  if (message === "File type not accepted") return `"${file.name}" não é um tipo aceito.`;
  if (message.startsWith("Maximum")) {
    return `Selecione até ${WHATSAPP_MAX_FILES_AT_ONCE} arquivos por vez.`;
  }

  return message;
}

const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer.types).includes("Files");

type ThreadAttachmentsProps = {
  conversationId: string;
  isConnected: boolean;
  children: ReactNode;
};

// Wraps the whole thread: the file picker, dragging a file over it and pasting an image all end in
// the same place. Dragging and pasting are handled here because Dice UI's drop zone takes Enter,
// Space and paste for itself, which would get in the way of the message box.
export function ThreadAttachments({
  conversationId,
  isConnected,
  children,
}: ThreadAttachmentsProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [captions, setCaptions] = useState<Map<File, string>>(new Map());
  const [isSending, setIsSending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sendMedia = useSendWhatsappMedia(conversationId);

  const addFiles = (chosen: File[]) => {
    if (!isConnected) return void toast.error("Conecte o WhatsApp para enviar arquivos.");

    const input = wrapperRef.current?.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input || chosen.length === 0) return;

    const transfer = new DataTransfer();
    for (const file of chosen) transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const endDrag = () => {
    dragDepth.current = 0;
    setIsDragging(false);
  };

  const onDrop = (event: DragEvent) => {
    if (!hasFiles(event)) return;

    event.preventDefault();
    endDrag();
    addFiles(Array.from(event.dataTransfer.files));
  };

  // Text pasted into the message box is left alone: only a clipboard with files is taken.
  const onPaste = (event: ReactClipboardEvent) => {
    const pasted = Array.from(event.clipboardData.files);
    if (pasted.length === 0) return;

    event.preventDefault();
    addFiles(pasted);
  };

  const forget = (file: File) => {
    setFiles((current) => current.filter((item) => item !== file));
    setCaptions((current) => {
      const next = new Map(current);
      next.delete(file);
      return next;
    });
  };

  // Resolves to whether every file went; what did not go stays, to try again.
  const send = async () => {
    setIsSending(true);

    try {
      for (const file of [...files]) {
        await sendMedia.mutateAsync({ file, caption: captions.get(file) ?? "" });
        forget(file);
      }
      return true;
    } catch {
      // The reason was already shown.
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const value: ThreadAttachmentsValue = {
    files,
    captionOf: (file) => captions.get(file) ?? "",
    setCaption: (file, caption) => setCaptions((current) => new Map(current).set(file, caption)),
    isSending,
    send,
    clear: () => {
      setFiles([]);
      setCaptions(new Map());
    },
  };

  return (
    <ThreadAttachmentsContext.Provider value={value}>
      <div
        ref={wrapperRef}
        className="relative h-full min-h-0"
        onDragEnter={(event) => {
          if (!hasFiles(event)) return;
          dragDepth.current += 1;
          setIsDragging(true);
        }}
        onDragOver={(event) => hasFiles(event) && event.preventDefault()}
        onDragLeave={(event) => {
          if (!hasFiles(event)) return;
          dragDepth.current -= 1;
          if (dragDepth.current <= 0) endDrag();
        }}
        onDrop={onDrop}
        onPaste={onPaste}
      >
        <FileUpload
          multiple
          className="h-full min-h-0 gap-0"
          label="Anexar arquivos"
          maxFiles={WHATSAPP_MAX_FILES_AT_ONCE}
          maxSize={WHATSAPP_MEDIA_MAX_BYTES}
          disabled={!isConnected || isSending}
          value={files}
          onValueChange={setFiles}
          onFileValidate={(file) => (file.size === 0 ? `"${file.name}" está vazio.` : null)}
          onFileReject={(file, message) => toast.error(rejectionText(file, message))}
        >
          {children}
        </FileUpload>
        {isDragging && (
          <div className="bg-background/85 border-primary/40 pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed">
            <PaperclipIcon className="text-muted-foreground size-8" />
            <p className="text-sm font-medium">Solte para anexar</p>
          </div>
        )}
      </div>
    </ThreadAttachmentsContext.Provider>
  );
}
