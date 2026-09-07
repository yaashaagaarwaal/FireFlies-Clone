"use client";

import { MessageSquareText } from "lucide-react";
import { useMemo, useState } from "react";

import type { TranscriptSegment } from "@/lib/types";

import { Transcript } from "./Transcript";
import { TranscriptSearch } from "./TranscriptSearch";

interface TranscriptPanelProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (seconds: number) => void;
}

export function TranscriptPanel({ segments, currentTime, onSeek }: TranscriptPanelProps) {
  const [query, setQuery] = useState("");
  const [matchIndex, setMatchIndex] = useState(0);

  const matchingSegmentIds = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return segments.filter((segment) => segment.text.toLowerCase().includes(trimmed)).map((s) => s.id);
  }, [segments, query]);

  // matchIndex is intentionally not reset on query change — indexing via
  // modulo below always lands on a valid match for the current result set,
  // so a dedicated reset effect (and the extra render it causes) isn't needed.
  const currentMatchSegmentId =
    matchingSegmentIds.length > 0 ? matchingSegmentIds[matchIndex % matchingSegmentIds.length] : null;

  function handleQueryChange(value: string) {
    setQuery(value);
    setMatchIndex(0);
  }

  function goToNextMatch() {
    if (matchingSegmentIds.length === 0) return;
    setMatchIndex((i) => (i + 1) % matchingSegmentIds.length);
  }

  function goToPrevMatch() {
    if (matchingSegmentIds.length === 0) return;
    setMatchIndex((i) => (i - 1 + matchingSegmentIds.length) % matchingSegmentIds.length);
  }

  return (
    <aside className="flex h-full w-full shrink-0 flex-col bg-white dark:bg-gray-900 md:w-[380px] md:border-l md:border-gray-200 dark:md:border-gray-800">
      <div className="border-b border-gray-100 p-4 dark:border-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2.5 text-sm font-semibold text-gray-900 dark:text-gray-100">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <MessageSquareText size={15} />
            </span>
            Transcript
          </h2>
          {segments.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {segments.length} {segments.length === 1 ? "line" : "lines"}
            </span>
          )}
        </div>
        <TranscriptSearch
          value={query}
          onChange={handleQueryChange}
          matchCount={matchingSegmentIds.length}
          currentMatchNumber={matchingSegmentIds.length > 0 ? matchIndex + 1 : 0}
          onNext={goToNextMatch}
          onPrev={goToPrevMatch}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <Transcript
          segments={segments}
          currentTime={currentTime}
          searchQuery={query}
          currentMatchSegmentId={currentMatchSegmentId}
          onSegmentClick={onSeek}
        />
      </div>
    </aside>
  );
}
