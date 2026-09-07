"use client";

import { SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Participant } from "@/lib/types";

import { Select } from "@/components/ui/Select";

interface FilterControlsProps {
  participants: Participant[];
  participantFilter: string;
  onParticipantFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  onClear: () => void;
}

export function FilterControls({
  participants,
  participantFilter,
  onParticipantFilterChange,
  dateFilter,
  onDateFilterChange,
  onClear,
}: FilterControlsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCount = [participantFilter, dateFilter].filter(Boolean).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`control-focus flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
          activeCount > 0
            ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400"
            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
        }`}
      >
        <SlidersHorizontal size={15} />
        Filters
        {activeCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{ animation: "modal-in 120ms ease-out" }}
          className="absolute left-0 z-20 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
              Participant
              <Select
                value={participantFilter}
                onChange={(event) => onParticipantFilterChange(event.target.value)}
              >
                <option value="">All participants</option>
                {participants.map((participant) => (
                  <option key={participant.id} value={participant.name}>
                    {participant.name}
                  </option>
                ))}
              </Select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
              Date
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => onDateFilterChange(event.target.value)}
                className="field-focus rounded-lg border border-gray-200 px-2.5 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:[color-scheme:dark]"
              />
            </label>

            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="control-focus self-start rounded text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
