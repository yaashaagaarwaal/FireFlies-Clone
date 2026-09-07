import { ChevronRight, Video } from "lucide-react";

import { formatDuration, formatMeetingDate } from "@/lib/format";
import type { MeetingListItem } from "@/lib/types";

import { ParticipantAvatars } from "./ParticipantAvatars";

interface MeetingRowProps {
  meeting: MeetingListItem;
  onClick: () => void;
}

export function MeetingRow({ meeting, onClick }: MeetingRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="control-focus group flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5 text-left shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-500/30"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:group-hover:bg-indigo-500/20">
        <Video size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{meeting.title}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <span>{formatMeetingDate(meeting.date)}</span>
          <span aria-hidden>•</span>
          <span>{formatDuration(meeting.duration_seconds)}</span>
        </p>
      </div>

      <ParticipantAvatars participants={meeting.participants} />

      <ChevronRight
        size={18}
        className="shrink-0 text-gray-300 transition-colors group-hover:text-indigo-400 dark:text-gray-700 dark:group-hover:text-indigo-400"
      />
    </button>
  );
}
