import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

/** A native <select>, restyled to match the app's inputs instead of each
 * browser's own default control — consistent border/radius/focus ring and
 * a custom chevron in place of the native one. */
export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`field-focus w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 ${className}`}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
      />
    </div>
  );
}
