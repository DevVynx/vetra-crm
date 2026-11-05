import { SendHorizontalIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { cn } from "@/shared/utils/cn";

import type { VoiceRecorderState } from "../hooks/useVoiceRecorder";

type VoiceRecorderBarProps = {
  state: Exclude<VoiceRecorderState, { phase: "idle" }>;
  isSending: boolean;
  onCancel: () => void;
  onSend: () => void;
};

const MIN_BAR_HEIGHT_PERCENT = 12;

function formatClock(seconds: number): string {
  const total = Math.floor(seconds);

  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

// The same row as the message box while recording: bin, time and a live level, then send.
export function VoiceRecorderBar({ state, isSending, onCancel, onSend }: VoiceRecorderBarProps) {
  return (
    <div className="flex items-center gap-2 p-3">
      <Button
        size="icon"
        variant="ghost"
        aria-label="Cancelar gravação"
        disabled={isSending}
        onClick={onCancel}
      >
        <Trash2Icon />
      </Button>
      <div className="bg-muted flex h-9 min-w-0 flex-1 items-center gap-3 rounded-full px-4">
        <span
          className={cn(
            "bg-destructive size-2.5 shrink-0 rounded-full",
            state.phase === "recording" && "animate-pulse"
          )}
        />
        <span role="timer" aria-label="Tempo de gravação" className="text-sm tabular-nums">
          {formatClock(state.seconds)}
        </span>
        <div aria-hidden className="flex h-6 min-w-0 flex-1 items-center gap-[2px] overflow-hidden">
          {state.levels.map((level, index) => (
            <span
              key={index}
              className="bg-muted-foreground w-[3px] shrink-0 rounded-full"
              style={{ height: `${Math.max(MIN_BAR_HEIGHT_PERCENT, level * 100)}%` }}
            />
          ))}
        </div>
      </div>
      <Button size="icon" aria-label="Enviar áudio" disabled={isSending} onClick={onSend}>
        {isSending ? <Spinner /> : <SendHorizontalIcon />}
      </Button>
    </div>
  );
}
