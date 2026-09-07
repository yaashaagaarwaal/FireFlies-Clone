/** Parses a datetime string returned by the API as UTC. The backend always
 * returns naive (no offset) ISO strings that are meant as UTC — passing
 * those straight to `new Date()` would have JS silently interpret them as
 * *local* time instead, shifting every timestamp by the viewer's UTC
 * offset. Read-only display can look right by coincidence (the misread and
 * the later re-localized formatting cancel out), but the moment a value
 * round-trips through `toISOString()` on save, the shift becomes real and
 * corrupts the stored time. Always go through this for API date strings.
 */
export function parseApiDate(isoString: string): Date {
  const hasTimezone = /[Zz]|[+-]\d{2}:?\d{2}$/.test(isoString);
  return new Date(hasTimezone ? isoString : `${isoString}Z`);
}

export function formatMeetingDate(isoDate: string): string {
  const date = parseApiDate(isoDate);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
}

/** Formats a Date as the value a <input type="datetime-local"> expects, in local time. */
export function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "MM:SS" (or "H:MM:SS" past an hour) for a media player's time labels. */
export function formatClockTime(totalSeconds: number): string {
  const safeSeconds = Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 0;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = Math.floor(safeSeconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
