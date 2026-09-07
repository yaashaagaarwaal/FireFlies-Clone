"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search by title or keyword" }: SearchBarProps) {
  return (
    <div className="flex w-full max-w-md items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 transition-colors focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-gray-700 dark:bg-gray-900 dark:focus-within:border-indigo-500 dark:focus-within:ring-indigo-500/20">
      <Search size={16} className="shrink-0 text-gray-400 dark:text-gray-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
      />
      <kbd className="hidden shrink-0 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-gray-700 dark:text-gray-500 sm:block">
        ⌘K
      </kbd>
    </div>
  );
}
