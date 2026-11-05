import { WHATSAPP_VOICE_MAX_SECONDS } from "@vetra/contracts";
import { useCallback, useEffect, useRef, useState } from "react";

export const VOICE_LEVEL_BARS = 32;

const SAMPLE_INTERVAL_MS = 90;
const SECOND_IN_MS = 1_000;
const BITS_PER_SECOND = 32_000;
// What the browser can record; WAHA converts it to what WhatsApp plays (see sendVoice in infra).
const MIME_TYPES = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4"];

export type VoiceRecorderProblem = "unsupported" | "denied" | "no-device" | "failed";

export type Recording = { blob: Blob; seconds: number };

export type VoiceRecorderState =
  | { phase: "idle" }
  | { phase: "recording"; seconds: number; levels: number[] }
  | { phase: "stopped"; seconds: number; levels: number[] };

type Session = {
  recorder: MediaRecorder;
  stream: MediaStream;
  context: AudioContext;
  chunks: Blob[];
  startedAt: number;
  levels: number[];
  timer: number;
};

function problemOf(error: unknown): VoiceRecorderProblem {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "no-device";

  return "failed";
}

function levelOf(analyser: AnalyserNode, buffer: Uint8Array<ArrayBuffer>): number {
  analyser.getByteTimeDomainData(buffer);

  let sum = 0;
  for (const value of buffer) sum += ((value - 128) / 128) ** 2;

  return Math.min(1, Math.sqrt(sum / buffer.length) * 4);
}

function release({ timer, stream, context }: Session) {
  window.clearInterval(timer);
  for (const track of stream.getTracks()) track.stop();
  void context.close();
}

// Records the microphone until finish(). The microphone is only on while recording: it is released
// when it stops, is cancelled, or the component goes away.
export function useVoiceRecorder() {
  const [state, setState] = useState<VoiceRecorderState>({ phase: "idle" });
  const session = useRef<Session | null>(null);
  const recorded = useRef<Recording | null>(null);
  const isMounted = useRef(true);

  const cancel = useCallback(() => {
    const current = session.current;
    session.current = null;
    recorded.current = null;

    if (current) {
      current.recorder.onstop = null;
      if (current.recorder.state !== "inactive") current.recorder.stop();
      release(current);
    }
    setState({ phase: "idle" });
  }, []);

  const finish = useCallback(async (): Promise<Recording | null> => {
    const current = session.current;
    if (!current) return recorded.current;

    session.current = null;
    const stopped = new Promise<Blob>((resolve) => {
      current.recorder.onstop = () =>
        resolve(new Blob(current.chunks, { type: current.recorder.mimeType }));
    });
    current.recorder.stop();

    const blob = await stopped;
    const seconds = (performance.now() - current.startedAt) / SECOND_IN_MS;
    release(current);

    recorded.current = { blob, seconds };
    setState({ phase: "stopped", seconds, levels: current.levels });

    return recorded.current;
  }, []);

  const start = useCallback(async (): Promise<VoiceRecorderProblem | null> => {
    if (session.current) return null;
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return "unsupported";
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      return problemOf(error);
    }

    try {
      if (!isMounted.current) throw new Error("The recorder was closed.");

      const mimeType = MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: BITS_PER_SECOND,
      });
      const context = new AudioContext();
      void context.resume();
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      context.createMediaStreamSource(stream).connect(analyser);
      const buffer = new Uint8Array(analyser.fftSize);

      const current: Session = {
        recorder,
        stream,
        context,
        chunks: [],
        startedAt: performance.now(),
        levels: [],
        timer: 0,
      };
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) current.chunks.push(event.data);
      };
      current.timer = window.setInterval(() => {
        const seconds = (performance.now() - current.startedAt) / SECOND_IN_MS;
        if (seconds >= WHATSAPP_VOICE_MAX_SECONDS) return void finish();

        current.levels = [...current.levels, levelOf(analyser, buffer)].slice(-VOICE_LEVEL_BARS);
        setState({ phase: "recording", seconds, levels: current.levels });
      }, SAMPLE_INTERVAL_MS);

      session.current = current;
      recorded.current = null;
      recorder.start();
      setState({ phase: "recording", seconds: 0, levels: [] });

      return null;
    } catch {
      for (const track of stream.getTracks()) track.stop();
      return "failed";
    }
  }, [finish]);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      cancel();
    };
  }, [cancel]);

  return { state, start, finish, cancel };
}
