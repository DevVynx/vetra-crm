import { PaperclipIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { FileUploadTrigger } from "@/shared/components/ui/file-upload";

export function AttachButton() {
  return (
    <FileUploadTrigger
      render={
        <Button
          size="icon"
          variant="ghost"
          aria-label="Anexar arquivo"
          title="Anexar arquivo (ou arraste e cole aqui)"
        >
          <PaperclipIcon />
        </Button>
      }
    />
  );
}
