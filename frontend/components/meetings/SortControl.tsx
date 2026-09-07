"use client";

import { ArrowUpDown, ChevronDown } from "lucide-react";

export type MeetingSort = "recent" | "title";

interface SortControlProps {
  value: MeetingSort;
  onChange: (value: MeetingSort) => void;
}

export function SortControl({ value, onChange }: SortControlProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white py-2 pl-2.5 pr-2 transition-colors hover:border-gray-300 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 dark:focus-within:border-indigo-500 dark:focus-within:ring-indigo-500/20">
      <ArrowUpDown size={15} className="shrink-0 text-gray-400 dark:text-gray-500" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as MeetingSort)}
        className="appearance-none bg-transparent pr-1 text-sm font-medium text-gray-700 outline-none dark:text-gray-300"
      >
        <option value="recent">Most recent</option>
        <option value="title">Title (A–Z)</option>
      </select>
      <ChevronDown size={14} className="shrink-0 text-gray-400 dark:text-gray-500" />
    </div>
  );
}
