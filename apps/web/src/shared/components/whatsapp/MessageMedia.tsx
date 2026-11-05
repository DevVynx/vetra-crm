import type { WhatsappMessage } from "@vetra/contracts";
import { DownloadIcon, FileTextIcon, ImageIcon, StickerIcon, VideoIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";
import { Spinner } from "@/shared/components/ui/spinner";
import { useWhatsappMediaFile } from "@/shared/queries/whatsapp/useWhatsappMediaFile";
import { cn } from "@/shared/utils/cn";

import { AudioPlayer } from "./AudioPlayer";
import { MediaProblem } from "./MediaProblem";
import type { MessageContact } from "./messageContact";

type MessageMediaProps = {
  conversationId: string;
  message: WhatsappMessage;
  contact?: MessageContact | undefined;
};

export const OPENABLE_MEDIA_TYPES = ["image", "sticker", "video", "document", "audio"] as const;

const FALLBACK_FILENAME = "arquivo";

// What the browser would refuse or misread in a download name.
const downloadNameOf = (filename: string | null) =>
  (filename ?? "").replace(/[\u0000-\u001f\u007f/\\]/g, "").trim() || FALLBACK_FILENAME;

function startDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}

function OpenTile({ icon: Icon, label, isLoading, onOpen }: OpenTileProps) {
  return (
    <Button
      variant="outline"
      className="bg-background/40 h-auto min-w-40 justify-start gap-2 py-3"
      disabled={isLoading}
      onClick={onOpen}
    >
      {isLoading ? <Spinner /> : <Icon />}
      {label}
    </Button>
  );
}

type OpenTileProps = {
  icon: typeof ImageIcon;
  label: string;
  isLoading: boolean;
  onOpen: () => void;
};

function FileMedia({ conversationId, message }: Omit<MessageMediaProps, "contact">) {
  const file = useWhatsappMediaFile({ conversationId, messageId: message.id });
  const [isEnlarged, setIsEnlarged] = useState(false);
  const retry = () => file.open();

  if (file.errorMessage && !file.objectUrl)
    return <MediaProblem message={file.errorMessage} onRetry={retry} />;

  if (message.type === "document") {
    const filename = message.mediaFilename ?? "Documento";

    return (
      // The message menu arrow sits at the bubble's top right, so the download button keeps clear of it.
      <div className="flex items-center gap-2 pr-6">
        <FileTextIcon className="text-muted-foreground size-5 shrink-0" />
        <span className="min-w-0 flex-1 truncate break-all">{filename}</span>
        <Button
          size="icon-sm"
          variant="outline"
          aria-label={`Baixar ${filename}`}
          title="Baixar"
          disabled={file.isLoading}
          onClick={() =>
            file.open((url) => startDownload(url, downloadNameOf(message.mediaFilename)))
          }
        >
          {file.isLoading ? <Spinner /> : <DownloadIcon />}
        </Button>
      </div>
    );
  }

  if (message.type === "video") {
    return file.objectUrl ? (
      <video controls src={file.objectUrl} className="max-h-72 max-w-full rounded-md" />
    ) : (
      <OpenTile icon={VideoIcon} label="Ver vídeo" isLoading={file.isLoading} onOpen={retry} />
    );
  }

  const isSticker = message.type === "sticker";

  if (!file.objectUrl) {
    return (
      <OpenTile
        icon={isSticker ? StickerIcon : ImageIcon}
        label={isSticker ? "Ver figurinha" : "Ver imagem"}
        isLoading={file.isLoading}
        onOpen={retry}
      />
    );
  }

  return (
    <>
      <button
        type="button"
        className="cursor-pointer self-start rounded-md outline-none focus-visible:ring-3"
        aria-label={isSticker ? "Ampliar figurinha" : "Ampliar imagem"}
        onClick={() => setIsEnlarged(true)}
      >
        <img
          src={file.objectUrl}
          alt={isSticker ? "Figurinha" : "Imagem recebida"}
          className={cn("max-w-full rounded-md", isSticker ? "max-h-44" : "max-h-72")}
        />
      </button>
      <Dialog open={isEnlarged} onOpenChange={setIsEnlarged}>
        <DialogContent className="w-auto max-w-[95vw] gap-0 p-2 sm:max-w-[95vw]">
          <DialogTitle className="sr-only">Imagem</DialogTitle>
          <img
            src={file.objectUrl}
            alt="Imagem ampliada"
            className="max-h-[85vh] max-w-full rounded-md"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function MessageMedia(props: MessageMediaProps) {
  const { contact, ...file } = props;

  return file.message.type === "audio" ? (
    <AudioPlayer {...file} contact={contact} />
  ) : (
    <FileMedia {...file} />
  );
}
