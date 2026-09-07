import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-200 bg-white/60 px-6 py-16 text-center dark:border-gray-800 dark:bg-gray-900/40">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-400">
        <Icon size={24} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
        <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      {action}
    </div>
  );
}
