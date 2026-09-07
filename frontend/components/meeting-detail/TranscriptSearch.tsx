"use client";

import { ChevronDown, ChevronUp, Search, X } from "lucide-react";

interface TranscriptSearchProps {
  value: string;
  onChange: (value: string) => void;
  matchCount: number;
  currentMatchNumber: number;
  onNext: () => void;
  onPrev: () => void;
}

export function TranscriptSearch({
  value,
  onChange,
  matchCount,
  currentMatchNumber,
  onNext,
  onPrev,
}: TranscriptSearchProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 transition-colors focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-gray-700 dark:bg-gray-900 dark:focus-within:border-indigo-500 dark:focus-within:ring-indigo-500/20">
      <Search size={14} className="shrink-0 text-gray-400 dark:text-gray-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search transcript…"
        className="w-full min-w-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
      />
      {value && (
        <>
          <span className="shrink-0 whitespace-nowrap text-xs text-gray-400 dark:text-gray-500">
            {matchCount > 0 ? `${currentMatchNumber} of ${matchCount}` : "No matches"}
          </span>
          <button
            type="button"
            onClick={onPrev}
            disabled={matchCount === 0}
            aria-label="Previous match"
            className="control-focus shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={matchCount === 0}
            aria-label="Next match"
            className="control-focus shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <ChevronDown size={14} />
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="control-focus shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X size={14} />
          </button>
        </>
      )}
    </div>
  );
}
