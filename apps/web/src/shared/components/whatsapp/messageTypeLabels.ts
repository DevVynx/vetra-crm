import type { WhatsappMessageType } from "@vetra/contracts";
import {
  FileTextIcon,
  ImageIcon,
  MicIcon,
  PaperclipIcon,
  StickerIcon,
  VideoIcon,
} from "lucide-react";
import type { ComponentType } from "react";

export const nonTextMessageLabels: Record<
  Exclude<WhatsappMessageType, "text">,
  { label: string; icon: ComponentType<{ className?: string }> }
> = {
  audio: { label: "Áudio", icon: MicIcon },
  image: { label: "Imagem", icon: ImageIcon },
  video: { label: "Vídeo", icon: VideoIcon },
  document: { label: "Documento", icon: FileTextIcon },
  sticker: { label: "Figurinha", icon: StickerIcon },
  other: { label: "Mídia", icon: PaperclipIcon },
};
