"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-emerald-100 bg-white text-gray-800",
  error: "border-red-100 bg-white text-gray-800",
  info: "border-gray-200 bg-white text-gray-800",
};

const VARIANT_ACCENT: Record<ToastVariant, string> = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  info: "bg-gray-300",
};

const VARIANT_ICON_STYLES: Record<ToastVariant, string> = {
  success: "bg-emerald-50 text-emerald-600",
  error: "bg-red-50 text-red-500",
  info: "bg-gray-100 text-gray-500",
};

const VARIANT_ICONS: Record<ToastVariant, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismissToast(id), 3500);
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = VARIANT_ICONS[toast.variant];
          return (
            <div
              key={toast.id}
              role="status"
              style={{ animation: "toast-in 200ms cubic-bezier(0.16, 1, 0.3, 1)" }}
              className={`pointer-events-auto relative flex items-start gap-2.5 overflow-hidden rounded-lg border pl-3.5 pr-8 py-3 text-sm shadow-lg ${VARIANT_STYLES[toast.variant]}`}
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${VARIANT_ACCENT[toast.variant]}`} />
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${VARIANT_ICON_STYLES[toast.variant]}`}
              >
                <Icon size={14} />
              </span>
              <span className="pt-0.5 leading-snug">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="control-focus absolute right-2 top-2 rounded p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
