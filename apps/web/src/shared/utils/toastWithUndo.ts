import { toast } from "sonner";

export function toastWithUndo(message: string, onUndo: () => void) {
  toast.success(message, { action: { label: "Desfazer", onClick: onUndo } });
}
