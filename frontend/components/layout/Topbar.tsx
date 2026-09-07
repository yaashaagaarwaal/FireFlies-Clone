"use client";

import { Bell } from "lucide-react";

import { SearchBar } from "@/components/meetings/SearchBar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/ToastProvider";

interface TopbarProps {
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
}

export function Topbar({ title, searchValue, onSearchChange, actions }: TopbarProps) {
  const { showToast } = useToast();

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white py-3 pl-16 pr-4 dark:border-gray-800 dark:bg-gray-900 sm:gap-4 sm:px-6">
      <h1 className="hidden shrink-0 truncate text-sm font-semibold text-gray-900 dark:text-gray-100 sm:block sm:max-w-[220px] lg:max-w-xs">
        {title}
      </h1>

      {onSearchChange && (
        <div className="min-w-0 flex-1">
          <SearchBar value={searchValue ?? ""} onChange={onSearchChange} />
        </div>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 lg:flex">
          3 Free meetings
        </span>
        <button
          type="button"
          onClick={() => showToast("Upgrade plans are coming soon", "info")}
          className="control-focus hidden rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 lg:block"
        >
          Upgrade
        </button>
        <button
          type="button"
          onClick={() => showToast("No new notifications", "info")}
          aria-label="Notifications"
          className="control-focus relative hidden rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300 sm:block"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
        </button>
        <ThemeToggle />
        {actions}
        <button
          type="button"
          onClick={() => showToast("Account switching is coming soon", "info")}
          aria-label="Account"
          className="control-focus flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8B7355] text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          Y
        </button>
      </div>
    </header>
  );
}
