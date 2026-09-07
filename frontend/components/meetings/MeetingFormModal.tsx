"use client";

import { AlertCircle, Radio, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { api, ApiError } from "@/lib/api";
import { parseApiDate, toDatetimeLocalValue } from "@/lib/format";
import type { MeetingDetail, Participant } from "@/lib/types";

import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/ToastProvider";

interface MeetingFormModalProps {
  mode: "create" | "edit";
  /** Required when mode === "edit" — the meeting being edited. */
  meeting?: MeetingDetail;
  participants: Participant[];
  onClose: () => void;
  onSaved: (meeting: MeetingDetail) => void;
}

const ACCEPTED_TRANSCRIPT_EXTENSIONS = ".txt,.vtt,.json";

export function MeetingFormModal({ mode, meeting, participants, onClose, onSaved }: MeetingFormModalProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState(meeting?.title ?? "");
  const [date, setDate] = useState(() =>
    toDatetimeLocalValue(meeting ? parseApiDate(meeting.date) : new Date()),
  );
  const [durationMinutes, setDurationMinutes] = useState(
    meeting ? Math.round(meeting.duration_seconds / 60) : 30,
  );
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<number[]>(
    meeting ? meeting.participants.map((participant) => participant.id) : [],
  );
  const [transcriptText, setTranscriptText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Belt-and-suspenders duplicate-submit guard: React's `submitting` state
  // update isn't visible until the next render, so a very fast double
  // Enter/click before that repaint could otherwise slip a second request
  // through even with the button disabled. The ref is checked synchronously.
  const isSubmittingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCreate = mode === "create";
  const fieldLabelClass = "text-xs font-medium text-gray-600";
  const fieldClass = "field-focus rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900";

  function toggleParticipant(id: number) {
    setSelectedParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id],
    );
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setTranscriptText(typeof reader.result === "string" ? reader.result : "");
      setFileName(file.name);
      setError(null);
    };
    reader.onerror = () => {
      setError("Couldn't read that file. Try pasting the transcript instead.");
    };
    reader.readAsText(file);

    // Allow re-selecting the same file later (e.g. after clearing it).
    event.target.value = "";
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSubmittingRef.current) return;

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (isCreate && !transcriptText.trim()) {
      setError("A transcript is required — paste one or upload a .txt, .vtt, or .json file.");
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        date: new Date(date).toISOString(),
        duration_seconds: Math.max(0, durationMinutes) * 60,
        participant_ids: selectedParticipantIds,
        ...(isCreate ? { transcript_text: transcriptText.trim() } : {}),
      };
      const saved =
        mode === "create"
          ? await api.meetings.create(payload)
          : await api.meetings.update(meeting!.id, payload);
      showToast(mode === "create" ? "Meeting created" : "Meeting updated", "success");
      onSaved(saved);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to save meeting.";
      setError(message);
      showToast(message, "error");
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={mode === "create" ? "New meeting" : "Edit meeting"}
      onClose={onClose}
      maxWidthClassName="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className={`flex flex-col gap-1 ${fieldLabelClass}`}>
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Product Sync"
            autoFocus
            className={`${fieldClass} placeholder:text-gray-400`}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className={`flex flex-col gap-1 ${fieldLabelClass}`}>
            Date &amp; time
            <input
              type="datetime-local"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className={`flex flex-col gap-1 ${fieldLabelClass}`}>
            Duration (min)
            <input
              type="number"
              min={0}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(Number(event.target.value))}
              className={fieldClass}
            />
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={fieldLabelClass}>Participants</span>
          <div className="flex max-h-32 flex-col gap-0.5 overflow-y-auto rounded-lg border border-gray-200 p-2">
            {participants.length === 0 && (
              <p className="px-1 py-1 text-xs text-gray-400">No participants yet.</p>
            )}
            {participants.map((participant) => (
              <label
                key={participant.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedParticipantIds.includes(participant.id)}
                  onChange={() => toggleParticipant(participant.id)}
                  className="control-focus h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-gray-300 accent-indigo-600"
                />
                {participant.name}
              </label>
            ))}
          </div>
        </div>

        {isCreate && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className={fieldLabelClass}>Transcript</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    showToast("Live meeting recording (bot join + real-time transcription) is coming soon", "info")
                  }
                  className="control-focus flex items-center gap-1.5 rounded text-xs font-medium text-gray-500 transition-colors hover:text-gray-700 hover:underline"
                >
                  <Radio size={12} />
                  Join a live call
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="control-focus flex items-center gap-1.5 rounded text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700 hover:underline"
                >
                  <Upload size={12} />
                  Upload file
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TRANSCRIPT_EXTENSIONS}
                onChange={handleFileSelected}
                className="hidden"
              />
            </div>
            <textarea
              value={transcriptText}
              onChange={(event) => {
                setTranscriptText(event.target.value);
                setFileName(null);
              }}
              placeholder={"[00:00] Alex: Thanks for hopping on the call.\n[00:12] Priya: Happy to be here."}
              rows={7}
              className={`${fieldClass} resize-y font-mono text-xs placeholder:text-gray-400`}
            />
            <p className="text-[11px] leading-relaxed text-gray-400">
              {fileName ? `Loaded from ${fileName}. ` : ""}
              One line per turn: <code className="rounded bg-gray-100 px-1 py-0.5">[MM:SS] Speaker: text</code>.
              WebVTT and JSON transcripts (.vtt / .json) are also auto-detected — paste directly or upload a
              .txt/.vtt/.json file. Speakers are matched to the participants above by name, or added
              automatically if new.
            </p>
          </div>
        )}

        {error && (
          <p className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <div className="mt-1 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="control-focus rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="control-focus rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Saving…" : mode === "create" ? "Create meeting" : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
