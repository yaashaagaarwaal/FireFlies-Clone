"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseMediaPlayerOptions {
  /** The meeting's real duration — the source of truth for the seek bar
   * range and time labels. This is independent of the underlying audio
   * file's own (shorter, looping) length, since that file is a placeholder
   * stand-in, not a real per-meeting recording. */
  durationSeconds: number;
}

/**
 * Drives play/pause/seek state off a `requestAnimationFrame` clock rather
 * than the <audio> element's own `timeupdate` events, so the UI stays
 * perfectly in sync with `durationSeconds` even when the placeholder audio
 * file is much shorter (it just loops underneath via the `loop` attribute).
 */
export function useMediaPlayer({ durationSeconds }: UseMediaPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clockStartPerfRef = useRef(0);
  const clockStartTimeRef = useRef(0);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.8);

  const repositionAudio = useCallback((logicalTime: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const audioDuration = audio.duration;
    if (Number.isFinite(audioDuration) && audioDuration > 0) {
      audio.currentTime = logicalTime % audioDuration;
    }
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    let frame: number;
    const tick = () => {
      const elapsed = (performance.now() - clockStartPerfRef.current) / 1000;
      const next = clockStartTimeRef.current + elapsed;
      if (next >= durationSeconds) {
        setCurrentTime(durationSeconds);
        setIsPlaying(false);
        audioRef.current?.pause();
        return;
      }
      setCurrentTime(next);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, durationSeconds]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const play = useCallback(() => {
    clockStartPerfRef.current = performance.now();
    clockStartTimeRef.current = currentTime;
    repositionAudio(currentTime);
    audioRef.current?.play().catch(() => {
      // Autoplay can be blocked before a user gesture; play() was itself
      // triggered by one here, so failures are rare — safe to ignore.
    });
    setIsPlaying(true);
  }, [currentTime, repositionAudio]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const seekTo = useCallback(
    (targetSeconds: number) => {
      const clamped = Math.max(0, Math.min(targetSeconds, durationSeconds));
      clockStartPerfRef.current = performance.now();
      clockStartTimeRef.current = clamped;
      setCurrentTime(clamped);
      repositionAudio(clamped);
    },
    [durationSeconds, repositionAudio],
  );

  const setVolume = useCallback((value: number) => {
    setVolumeState(Math.max(0, Math.min(1, value)));
  }, []);

  return { audioRef, currentTime, isPlaying, volume, togglePlay, seekTo, setVolume };
}
