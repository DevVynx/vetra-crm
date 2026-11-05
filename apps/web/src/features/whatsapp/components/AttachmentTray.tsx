import { XIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
} from "@/shared/components/ui/file-upload";
import { Input } from "@/shared/components/ui/input";
import { pluralize } from "@/shared/utils/format";

import { takesCaption, useThreadAttachments } from "./ThreadAttachments";

const CAPTION_MAX_LENGTH = 1024;

// What was chosen, before it leaves the browser: a preview, a caption where it fits, and a way back.
export function AttachmentTray() {
  const { files, captionOf, setCaption, isSending, send, clear } = useThreadAttachments();
  if (files.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 border-t p-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">
          {pluralize(files.length, "arquivo", "arquivos")} para enviar
        </span>
        <Button size="xs" variant="ghost" disabled={isSending} onClick={clear}>
          Limpar
        </Button>
      </div>
      <FileUploadList className="max-h-60 overflow-y-auto">
        {files.map((file, index) => (
          <FileUploadItem key={`${index}-${file.name}`} value={file} className="flex-wrap">
            <FileUploadItemPreview />
            <FileUploadItemMetadata />
            <FileUploadItemDelete
              render={
                <Button
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`Remover ${file.name}`}
                  disabled={isSending}
                >
                  <XIcon />
                </Button>
              }
            />
            {takesCaption(file) && (
              <Input
                aria-label={`Legenda de ${file.name}`}
                placeholder="Adicionar legenda"
                className="basis-full"
                maxLength={CAPTION_MAX_LENGTH}
                disabled={isSending}
                value={captionOf(file)}
                onChange={(event) => setCaption(file, event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" || event.nativeEvent.isComposing) return;

                  event.preventDefault();
                  void send();
                }}
              />
            )}
          </FileUploadItem>
        ))}
      </FileUploadList>
    </div>
  );
}
