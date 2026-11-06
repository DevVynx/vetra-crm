import type { NextAction } from "@vetra/contracts";
import { BanIcon, SendIcon, TriangleAlertIcon } from "lucide-react";

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
import { Spinner } from "@/shared/components/ui/spinner";
import { balloonsOf, hasMarker } from "@/shared/utils/autoSend";
import { cn } from "@/shared/utils/cn";
import { pluralize } from "@/shared/utils/format";

// Three dialogs that must never be mistaken for each other: the plain one, the one for a text with a
// marker still to fill in, and the one for a lead that asked not to be contacted, which is red all over.
type Mode = "normal" | "marker" | "doNotContact";

type SendConfirmDialogProps = {
  action: NextAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  // Whether the user is confirming a warning, which the server asks to be told about.
  onConfirm: (isWarning: boolean) => void;
};

const modeOf = (action: NextAction): Mode => {
  if (action.lead.doNotContact) return "doNotContact";

  return hasMarker(action.body) ? "marker" : "normal";
};

export function SendConfirmDialog({
  action,
  open,
  onOpenChange,
  isPending,
  onConfirm,
}: SendConfirmDialogProps) {
  const mode = modeOf(action);
  const balloons = balloonsOf(action.body);
  const name = action.lead.businessName;
  const isWarning = mode !== "normal";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          "data-[size=default]:sm:max-w-lg",
          mode === "doNotContact" && "ring-destructive ring-2",
          mode === "marker" && "ring-warning ring-2"
        )}
      >
        {mode === "doNotContact" && (
          <div className="bg-destructive text-destructive-foreground -mx-6 -mt-6 flex items-center gap-2.5 rounded-t-xl px-6 py-3 text-sm font-bold tracking-wide uppercase">
            <BanIcon className="size-5" />
            Não contatar
          </div>
        )}

        <AlertDialogHeader>
          <AlertDialogMedia
            className={cn(
              mode === "doNotContact" && "bg-destructive/15 text-destructive",
              mode === "marker" && "bg-warning/15 text-warning"
            )}
          >
            {mode === "doNotContact" ? (
              <BanIcon />
            ) : mode === "marker" ? (
              <TriangleAlertIcon />
            ) : (
              <SendIcon />
            )}
          </AlertDialogMedia>
          <AlertDialogTitle className={cn(mode === "doNotContact" && "text-destructive")}>
            {mode === "doNotContact"
              ? "Esta pessoa pediu para não ser contatada"
              : mode === "marker"
                ? "O texto ainda tem um campo para preencher"
                : "Enviar esta mensagem?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {mode === "doNotContact" && (
              <>
                <strong className="text-foreground">{name}</strong> está marcada como &quot;Não
                contatar&quot;. Enviar vai contra o pedido dela.
                {hasMarker(action.body) &&
                  " O texto também ainda tem [SEU WHATSAPP], que deve ser trocado pelo seu número."}
              </>
            )}
            {mode === "marker" &&
              "O texto tem [SEU WHATSAPP], que deve ser trocado pelo seu número. Se enviar agora, a mensagem sai com esse marcador."}
            {mode === "normal" && (
              <>
                Para <strong className="text-foreground">{name}</strong>. Ela sai agora e não dá
                para desfazer.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-xs font-medium">
            {pluralize(balloons.length, "mensagem", "mensagens")}
          </p>
          <div className="bg-muted/40 flex max-h-56 flex-col gap-2 overflow-y-auto rounded-lg border p-3">
            {balloons.map((balloon, index) => (
              <p
                key={index}
                className="bg-background rounded-md border px-3 py-2 text-sm break-words whitespace-pre-wrap"
              >
                {balloon}
              </p>
            ))}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="h-10">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="h-10 font-semibold"
            variant={mode === "doNotContact" ? "destructive" : "default"}
            disabled={isPending}
            onClick={() => onConfirm(isWarning)}
          >
            {isPending && <Spinner />}
            {isWarning ? "Enviar mesmo assim" : "Enviar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
