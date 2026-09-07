"use client";

import { Pause, Play, Volume1, Volume2, VolumeX } from "lucide-react";
import type { RefObject } from "react";

import { formatClockTime } from "@/lib/format";

interface MediaPlayerProps {
  audioRef: RefObject<HTMLAudioElement | null>;
  src: string;
  durationSeconds: number;
  currentTime: number;
  isPlaying: boolean;
  volume: number;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (value: number) => void;
}

function VolumeIcon({ volume }: { volume: number }) {
  if (volume === 0) return <VolumeX size={16} />;
  if (volume < 0.5) return <Volume1 size={16} />;
  return <Volume2 size={16} />;
}

export function MediaPlayer({
  audioRef,
  src,
  durationSeconds,
  currentTime,
  isPlaying,
  volume,
  onTogglePlay,
  onSeek,
  onVolumeChange,
}: MediaPlayerProps) {
  return (
    <section className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <audio ref={audioRef} src={src} loop preload="metadata" />

      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="control-focus flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm transition-all hover:scale-105 hover:bg-indigo-700 active:scale-95"
      >
        {isPlaying ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
      </button>

      <span className="w-11 shrink-0 font-mono text-xs text-gray-500 dark:text-gray-400">{formatClockTime(currentTime)}</span>

      <input
        type="range"
        min={0}
        max={Math.max(durationSeconds, 0.1)}
        step={0.1}
        value={currentTime}
        onChange={(event) => onSeek(Number(event.target.value))}
        aria-label="Seek"
        className="control-focus h-1.5 flex-1 cursor-pointer rounded-full accent-indigo-600"
      />

      <span className="w-11 shrink-0 font-mono text-xs text-gray-500 dark:text-gray-400">{formatClockTime(durationSeconds)}</span>

      <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
        <VolumeIcon volume={volume} />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(event) => onVolumeChange(Number(event.target.value))}
          aria-label="Volume"
          className="control-focus h-1.5 w-20 cursor-pointer rounded-full accent-indigo-600"
        />
      </div>
    </section>
  );
}
