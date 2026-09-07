import { ArrowLeft, Calendar, Clock, Pencil, Share2, Trash2 } from "lucide-react";
import Link from "next/link";

import { formatDuration, formatMeetingDate } from "@/lib/format";
import type { MeetingDetail } from "@/lib/types";

import { ParticipantAvatars } from "@/components/meetings/ParticipantAvatars";
import { useToast } from "@/components/ui/ToastProvider";

interface MeetingHeaderProps {
  meeting: MeetingDetail;
  onEdit: () => void;
  onDeleteRequest: () => void;
}

export function MeetingHeader({ meeting, onEdit, onDeleteRequest }: MeetingHeaderProps) {
  const { showToast } = useToast();

  return (
    <header className="flex flex-col gap-3 border-b border-gray-100 pb-5 dark:border-gray-800">
      <Link
        href="/dashboard"
        className="control-focus inline-flex w-fit items-center gap-1.5 rounded text-xs font-medium text-gray-500 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft size={13} />
        Back to meetings
      </Link>

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-gray-900 dark:text-gray-100">{meeting.title}</h1>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => showToast("Sharing is coming soon", "info")}
            className="control-focus flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <Share2 size={13} />
            Share
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="control-focus flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
          >
            <Pencil size={13} />
            Edit
          </button>
          <button
            type="button"
            onClick={onDeleteRequest}
            className="control-focus flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 dark:border-gray-700 dark:text-red-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} />
          {formatMeetingDate(meeting.date)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          {formatDuration(meeting.duration_seconds)}
        </span>
        <ParticipantAvatars participants={meeting.participants} />
      </div>
    </header>
  );
}
