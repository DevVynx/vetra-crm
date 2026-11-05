import type { WhatsappMessage } from "@vetra/contracts";
import { MicIcon, MusicIcon, PauseIcon, PlayIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { BusinessAvatar } from "@/shared/components/BusinessAvatar";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { useMarkWhatsappMessagePlayed } from "@/shared/mutations/whatsapp/useMarkWhatsappMessagePlayed";
import { useProfile } from "@/shared/queries/profile/useProfile";
import { useProfilePhotoUrl } from "@/shared/queries/profile/useProfilePhotoUrl";
import { useWhatsappMediaFile } from "@/shared/queries/whatsapp/useWhatsappMediaFile";
import { cn } from "@/shared/utils/cn";

import { MediaProblem } from "./MediaProblem";
import type { MessageContact } from "./messageContact";

type AudioPlayerProps = {
  conversationId: string;
  message: WhatsappMessage;
  contact?: MessageContact | undefined;
};

// Only one plays at a time, like on WhatsApp.
let playingNow: HTMLAudioElement | null = null;

const SECONDS_IN_MINUTE = 60;
const BAR_COUNT = 36;
const FLAT_BAR = 0.3;
const MIN_BAR = 0.14;

function timeOf(seconds: number): string {
  const whole = Math.floor(seconds);

  return `${Math.floor(whole / SECONDS_IN_MINUTE)}:${String(whole % SECONDS_IN_MINUTE).padStart(2, "0")}`;
}

// WAHA gives the bars as bytes in base64. A bar is the loudest of its slice, so a long voice
// message and a short one both fill the same width. Without them, a flat line.
function barsOf(waveform: string | null): number[] {
  const flat = Array.from({ length: BAR_COUNT }, () => FLAT_BAR);
  if (!waveform) return flat;

  try {
    const bytes = Uint8Array.from(atob(waveform), (character) => character.charCodeAt(0));
    if (bytes.length === 0) return flat;

    const loudest = Math.max(...bytes, 1);
    return Array.from({ length: BAR_COUNT }, (_, index) => {
      const from = Math.floor((index * bytes.length) / BAR_COUNT);
      const to = Math.max(from + 1, Math.floor(((index + 1) * bytes.length) / BAR_COUNT));

      return Math.max(MIN_BAR, Math.max(...bytes.subarray(from, to)) / loudest);
    });
  } catch {
    return flat;
  }
}

export function AudioPlayer({ conversationId, message, contact }: AudioPlayerProps) {
  const file = useWhatsappMediaFile({ conversationId, messageId: message.id });
  const markPlayed = useMarkWhatsappMessagePlayed(conversationId);
  const { data: profile } = useProfile();
  const profilePhotoUrl = useProfilePhotoUrl();
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasMarkedPlayed = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wantsToPlay, setWantsToPlay] = useState(false);
  const [position, setPosition] = useState(0);
  const [loadedDuration, setLoadedDuration] = useState<number | null>(null);
  const bars = useMemo(() => barsOf(message.mediaWaveform), [message.mediaWaveform]);
  // WAHA gives the length with the message; a recorded file may not know its own until it ends.
  const duration = message.mediaSeconds ?? loadedDuration ?? 0;
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;
  const hasStarted = isPlaying || position > 0;
  // The photo is the sender's: the contact's for what arrived, and the profile's for what the user sent.
  const sender =
    message.direction === "inbound"
      ? { name: contact?.name ?? "", photoUrl: contact?.photoUrl ?? undefined }
      : { name: profile?.name ?? "", photoUrl: profilePhotoUrl };

  useEffect(() => {
    if (file.objectUrl && wantsToPlay) {
      setWantsToPlay(false);
      void audioRef.current?.play();
    }
  }, [file.objectUrl, wantsToPlay]);

  const start = () => {
    setWantsToPlay(true);
    file.open();
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!file.objectUrl || !audio) return start();

    if (audio.paused) void audio.play();
    else audio.pause();
  };

  const seek = (seconds: number) => {
    if (audioRef.current) audioRef.current.currentTime = seconds;
    setPosition(seconds);
  };

  // What the user listens to counts as heard; what they sent is marked by WhatsApp's own receipts.
  const countAsHeard = () => {
    if (message.direction !== "inbound" || message.isPlayed || hasMarkedPlayed.current) return;

    hasMarkedPlayed.current = true;
    markPlayed.mutate(message.id);
  };

  if (file.errorMessage && !file.objectUrl) {
    return <MediaProblem message={file.errorMessage} onRetry={start} />;
  }

  return (
    <div className="flex min-w-64 items-center gap-2.5 pb-3">
      <Button
        size="icon"
        variant="ghost"
        className="shrink-0"
        aria-label={isPlaying ? "Pausar áudio" : "Tocar áudio"}
        disabled={file.isLoading}
        onClick={toggle}
      >
        {file.isLoading ? <Spinner /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
      </Button>

      <div className="relative min-w-0 flex-1">
        <div className="relative flex h-8 items-center">
          <div aria-hidden className="flex h-full w-full items-center gap-px">
            {bars.map((height, index) => (
              <span
                key={index}
                className={cn(
                  "w-full min-w-px rounded-full",
                  (index + 0.5) / BAR_COUNT <= progress ? "bg-info" : "bg-muted-foreground/50"
                )}
                style={{ height: `${height * 100}%` }}
              />
            ))}
          </div>
          <span
            aria-hidden
            className="bg-info pointer-events-none absolute size-2.5 -translate-x-1/2 rounded-full"
            style={{ left: `${progress * 100}%` }}
          />
          <input
            type="range"
            aria-label="Posição do áudio"
            className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-default"
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(position, duration)}
            disabled={!file.objectUrl}
            onChange={(event) => seek(Number(event.target.value))}
          />
        </div>
        {/* Out of the flow, so the bars sit at the same height as the button and the photo. */}
        <span className="text-muted-foreground absolute top-full left-0 text-xs tabular-nums">
          {timeOf(hasStarted ? position : duration)}
        </span>
      </div>

      {message.isVoice ? (
        <div className="relative shrink-0">
          <BusinessAvatar name={sender.name} photoUrl={sender.photoUrl} className="size-10" />
          <MicIcon
            role="img"
            aria-label={
              message.isPlayed ? "Mensagem de voz ouvida" : "Mensagem de voz ainda não ouvida"
            }
            className={cn(
              "bg-background absolute -right-1 -bottom-1 size-5 rounded-full p-0.5",
              message.isPlayed ? "text-info" : "text-muted-foreground"
            )}
          />
        </div>
      ) : (
        <MusicIcon
          role="img"
          aria-label="Áudio"
          className="text-muted-foreground size-5 shrink-0"
        />
      )}

      {file.objectUrl && (
        <audio
          ref={audioRef}
          src={file.objectUrl}
          onPlay={(event) => {
            if (playingNow && playingNow !== event.currentTarget) playingNow.pause();
            playingNow = event.currentTarget;
            setIsPlaying(true);
            countAsHeard();
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setPosition(0);
          }}
          onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => {
            const { duration: length } = event.currentTarget;
            if (Number.isFinite(length)) setLoadedDuration(length);
          }}
        />
      )}
    </div>
  );
}
