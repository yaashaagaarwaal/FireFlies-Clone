"use client";

import { useEffect, useMemo, useRef } from "react";

import type { TranscriptSegment } from "@/lib/types";

import { TranscriptSegmentRow } from "./TranscriptSegmentRow";

interface TranscriptProps {
  segments: TranscriptSegment[];
  currentTime: number;
  searchQuery: string;
  currentMatchSegmentId: number | null;
  onSegmentClick: (startTimeSeconds: number) => void;
}

function findActiveSegmentId(segments: TranscriptSegment[], currentTime: number): number | null {
  const withinRange = segments.find(
    (segment) => currentTime >= segment.start_time_sec && currentTime < segment.end_time_sec,
  );
  if (withinRange) return withinRange.id;

  // Between segments (a gap) or past the last one: treat the most recently
  // started segment as active, so highlighting doesn't blink off in gaps.
  const started = [...segments].reverse().find((segment) => currentTime >= segment.start_time_sec);
  return started?.id ?? null;
}

export function Transcript({
  segments,
  currentTime,
  searchQuery,
  currentMatchSegmentId,
  onSegmentClick,
}: TranscriptProps) {
  const activeSegmentId = useMemo(() => findActiveSegmentId(segments, currentTime), [segments, currentTime]);
  const rowRefs = useRef(new Map<number, HTMLButtonElement>());

  // Search matches should always snap into view when they change — that's
  // an explicit navigation action. Re-scrolling to the same still-active
  // segment on every playback tick is naturally avoided already: this
  // effect only re-runs when activeSegmentId/currentMatchSegmentId's actual
  // *value* changes (React compares primitives by value), not on every
  // currentTime update, so there was never a need for an extra "did we
  // already scroll here" guard — and that guard actively broke re-scrolling
  // when the same segment became the target again after the user (or a
  // search) had scrolled elsewhere in the meantime.
  useEffect(() => {
    const target = currentMatchSegmentId ?? activeSegmentId;
    if (target === null) return;
    // `behavior: "smooth"` (as either the scrollIntoView option or via CSS
    // `scroll-behavior`) silently no-ops here — confirmed by direct testing —
    // in this nested-scroll-container layout, in this browser. "instant"
    // reliably works, so a slightly abrupt jump beats a scroll that never
    // happens at all.
    rowRefs.current.get(target)?.scrollIntoView({ behavior: "instant", block: "nearest" });
  }, [activeSegmentId, currentMatchSegmentId]);

  if (segments.length === 0) {
    return <p className="px-1 py-8 text-center text-sm text-gray-400">No transcript available for this meeting yet.</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {segments.map((segment) => (
        <TranscriptSegmentRow
          key={segment.id}
          ref={(el) => {
            if (el) rowRefs.current.set(segment.id, el);
            else rowRefs.current.delete(segment.id);
          }}
          segment={segment}
          isActive={segment.id === activeSegmentId}
          isCurrentMatch={segment.id === currentMatchSegmentId}
          searchQuery={searchQuery}
          onClick={() => onSegmentClick(segment.start_time_sec)}
        />
      ))}
    </div>
  );
}
