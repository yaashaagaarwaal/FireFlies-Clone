import { forwardRef } from "react";

import { formatClockTime, initialsFor } from "@/lib/format";
import type { TranscriptSegment } from "@/lib/types";

import { HighlightedText } from "./HighlightedText";

interface TranscriptSegmentRowProps {
  segment: TranscriptSegment;
  isActive: boolean;
  isCurrentMatch: boolean;
  searchQuery: string;
  onClick: () => void;
}

export const TranscriptSegmentRow = forwardRef<HTMLButtonElement, TranscriptSegmentRowProps>(
  function TranscriptSegmentRow({ segment, isActive, isCurrentMatch, searchQuery, onClick }, ref) {
    const speakerName = segment.speaker?.name ?? "Unknown speaker";
    const speakerColor = segment.speaker?.avatar_color ?? "#9CA3AF";

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={`control-focus flex w-full gap-3 rounded-lg border-l-[3px] px-3 py-2.5 text-left transition-colors ${
          isActive
            ? "border-l-indigo-500 bg-indigo-50/80 dark:bg-indigo-500/10"
            : isCurrentMatch
              ? "border-l-amber-400 bg-amber-50 dark:bg-amber-500/10"
              : "border-l-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
        }`}
      >
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-white dark:ring-gray-900"
          style={{ backgroundColor: speakerColor }}
        >
          {initialsFor(speakerName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className={`text-xs font-semibold ${isActive ? "text-indigo-700 dark:text-indigo-400" : "text-gray-900 dark:text-gray-100"}`}>
              {speakerName}
            </span>
            <span
              className={`flex items-center gap-1 font-mono text-[11px] ${isActive ? "text-indigo-500 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}`}
            >
              {isActive && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />}
              {formatClockTime(segment.start_time_sec)}
            </span>
          </div>
          <p
            className={`mt-0.5 text-sm leading-relaxed ${isActive ? "font-medium text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}`}
          >
            <HighlightedText text={segment.text} query={searchQuery} />
          </p>
        </div>
      </button>
    );
  },
);
