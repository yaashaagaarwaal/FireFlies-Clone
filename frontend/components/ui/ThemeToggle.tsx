"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Listener = () => void;

// The "store" here is just document.documentElement's class list — there's
// no change event for it, so toggle() notifies these listeners manually
// after mutating it, which is what makes useSyncExternalStore re-render.
const listeners = new Set<Listener>();

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

// Matches what the server always renders (no access to the client's saved
// preference) — useSyncExternalStore reconciles this against getSnapshot()
// right after hydration with no mismatch warning, which is exactly the case
// it's designed for, unlike a plain useState+useEffect mount pattern.
function getServerSnapshot() {
  return false;
}

function setTheme(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
  try {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch {
    // Private-browsing / storage-blocked contexts: theme still applies for
    // this page load, it just won't persist across reloads.
  }
  listeners.forEach((listener) => listener());
}

interface ThemeToggleProps {
  /** "on-dark" is for bars that are always a dark color regardless of the
   * site's light/dark mode (e.g. the marketing nav) — needs its own fixed
   * light-icon-on-dark styling instead of the default light/dark: pair. */
  variant?: "default" | "on-dark";
}

const VARIANT_CLASSES: Record<NonNullable<ThemeToggleProps["variant"]>, string> = {
  default:
    "text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300",
  "on-dark": "text-gray-300 hover:bg-white/10 hover:text-white",
};

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => setTheme(!isDark)}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`control-focus flex shrink-0 items-center justify-center rounded-lg p-2 transition-colors ${VARIANT_CLASSES[variant]}`}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
