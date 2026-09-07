"use client";

import { VideoOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import { api, ApiError } from "@/lib/api";
import { useMediaPlayer } from "@/lib/hooks/useMediaPlayer";
import type { MeetingDetail, Participant } from "@/lib/types";

import { Topbar } from "@/components/layout/Topbar";
import { MeetingFormModal } from "@/components/meetings/MeetingFormModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/ToastProvider";

import { ActionItems } from "./ActionItems";
import { MediaPlayer } from "./MediaPlayer";
import { MeetingDetailSkeleton } from "./MeetingDetailSkeleton";
import { MeetingHeader } from "./MeetingHeader";
import { SummaryPanel } from "./SummaryPanel";
import { TopicList } from "./TopicList";
import { TranscriptPanel } from "./TranscriptPanel";

const PLACEHOLDER_AUDIO_SRC = "/sample-audio.wav";

interface MeetingDetailViewProps {
  meetingId: number;
}

export function MeetingDetailView({ meetingId }: MeetingDetailViewProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [, startTransition] = useTransition();

  const fetchMeeting = useCallback(() => {
    startTransition(async () => {
      // A non-numeric or non-positive id (e.g. /meetings/abc) can never
      // match a real meeting — treat it as not-found locally instead of
      // sending a malformed request the backend would just reject with a 422.
      if (!Number.isInteger(meetingId) || meetingId <= 0) {
        setNotFound(true);
        return;
      }

      try {
        const result = await api.meetings.get(meetingId);
        setMeeting(result);
        setErrorMessage(null);
        setNotFound(false);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          const message = err instanceof ApiError ? err.message : "Could not load this meeting.";
          setErrorMessage(message);
        }
      }
    });
  }, [meetingId]);

  useEffect(() => {
    fetchMeeting();
  }, [fetchMeeting]);

  useEffect(() => {
    api.participants
      .list()
      .then(setParticipants)
      .catch(() => {
        // Non-critical: only powers the edit modal's participant picker.
      });
  }, []);

  const player = useMediaPlayer({ durationSeconds: meeting?.duration_seconds ?? 0 });
  const mediaSrc = meeting?.media_url ?? PLACEHOLDER_AUDIO_SRC;

  async function handleDeleteMeeting() {
    if (!meeting) return;
    try {
      await api.meetings.delete(meeting.id);
      showToast("Meeting deleted", "success");
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to delete meeting.";
      showToast(message, "error");
      setDeleteConfirmOpen(false);
    }
  }

  if (notFound) {
    return (
      <>
        <Topbar title="Meeting" />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <VideoOff size={24} />
          </div>
          <p className="text-lg font-semibold text-gray-900">Meeting not found</p>
          <p className="-mt-1 max-w-sm text-sm text-gray-500">
            It may have been deleted, or the link is incorrect.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="control-focus mt-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow active:scale-[0.98]"
          >
            Back to meetings
          </button>
        </main>
      </>
    );
  }

  if (errorMessage) {
    return (
      <>
        <Topbar title="Meeting" />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <ErrorState message={errorMessage} onRetry={fetchMeeting} />
        </main>
      </>
    );
  }

  if (!meeting) {
    return (
      <>
        <Topbar title="Meeting" />
        <MeetingDetailSkeleton />
      </>
    );
  }

  return (
    <>
      <Topbar title={meeting.title} />

      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <div className="h-1/2 overflow-y-auto px-4 py-6 sm:px-6 md:h-auto md:flex-1">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <MeetingHeader
              meeting={meeting}
              onEdit={() => setEditModalOpen(true)}
              onDeleteRequest={() => setDeleteConfirmOpen(true)}
            />

            <MediaPlayer
              audioRef={player.audioRef}
              src={mediaSrc}
              durationSeconds={meeting.duration_seconds}
              currentTime={player.currentTime}
              isPlaying={player.isPlaying}
              volume={player.volume}
              onTogglePlay={player.togglePlay}
              onSeek={player.seekTo}
              onVolumeChange={player.setVolume}
            />

            <SummaryPanel summary={meeting.summary} />

            <TopicList topics={meeting.topics} onSeek={player.seekTo} />

            <ActionItems
              meetingId={meeting.id}
              actionItems={meeting.action_items}
              participants={meeting.participants}
              onChanged={fetchMeeting}
            />
          </div>
        </div>

        <div className="h-1/2 border-t border-gray-200 md:h-auto md:border-t-0">
          <TranscriptPanel
            segments={meeting.transcript_segments}
            currentTime={player.currentTime}
            onSeek={player.seekTo}
          />
        </div>
      </div>

      {isEditModalOpen && (
        <MeetingFormModal
          mode="edit"
          meeting={meeting}
          participants={participants}
          onClose={() => setEditModalOpen(false)}
          onSaved={(updated) => {
            setMeeting(updated);
            setEditModalOpen(false);
          }}
        />
      )}

      {isDeleteConfirmOpen && (
        <ConfirmDialog
          title="Delete meeting"
          message={`Delete "${meeting.title}"? This also permanently removes its transcript, summary, topics, and action items. This can't be undone.`}
          confirmLabel="Delete"
          destructive
          onCancel={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDeleteMeeting}
        />
      )}
    </>
  );
}
