import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-red-100 bg-red-50/50 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-500">
        <AlertTriangle size={24} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-gray-900">Something went wrong</p>
        <p className="max-w-sm text-sm text-gray-500">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="control-focus rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
      >
        Retry
      </button>
    </div>
  );
}
