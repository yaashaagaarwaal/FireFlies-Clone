"use client";

import { ArrowUpDown, ChevronDown } from "lucide-react";

export type MeetingSort = "recent" | "title";

interface SortControlProps {
  value: MeetingSort;
  onChange: (value: MeetingSort) => void;
}

export function SortControl({ value, onChange }: SortControlProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white py-2 pl-2.5 pr-2 transition-colors hover:border-gray-300 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100">
      <ArrowUpDown size={15} className="shrink-0 text-gray-400" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as MeetingSort)}
        className="appearance-none bg-transparent pr-1 text-sm font-medium text-gray-700 outline-none"
      >
        <option value="recent">Most recent</option>
        <option value="title">Title (A–Z)</option>
      </select>
      <ChevronDown size={14} className="shrink-0 text-gray-400" />
    </div>
  );
}
