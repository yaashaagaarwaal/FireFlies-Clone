"use client";

import { Plus, SearchX, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import { Topbar } from "@/components/layout/Topbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { MeetingListSkeleton } from "@/components/ui/MeetingRowSkeleton";
import { useToast } from "@/components/ui/ToastProvider";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { api, ApiError } from "@/lib/api";
import type { MeetingDetail, MeetingListItem, Participant } from "@/lib/types";

import { MeetingFormModal } from "./MeetingFormModal";
import { FilterControls } from "./FilterControls";
import { MeetingList } from "./MeetingList";
import { SortControl, type MeetingSort } from "./SortControl";

export function MeetingsDashboard() {
  const router = useRouter();
  const { showToast } = useToast();

  // meetings stays null until the first successful load — that's what
  // distinguishes the initial "loading" state from "idle" with zero results.
  // status is derived rather than its own useState so fetchMeetings never
  // sets state synchronously before its first `await` (the pattern React's
  // effect linter flags as a cascading-render risk).
  const [meetings, setMeetings] = useState<MeetingListItem[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const status: "loading" | "idle" | "error" =
    errorMessage !== null ? "error" : meetings === null ? "loading" : "idle";

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [participantFilter, setParticipantFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sort, setSort] = useState<MeetingSort>("recent");

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const [, startTransition] = useTransition();

  const fetchMeetings = useCallback(() => {
    startTransition(async () => {
      try {
        const result = await api.meetings.list({
          search: debouncedSearch || undefined,
          participant: participantFilter || undefined,
          date: dateFilter || undefined,
          sort,
        });
        setMeetings(result);
        setErrorMessage(null);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Could not load meetings. Is the backend running?";
        setErrorMessage(message);
      }
    });
  }, [debouncedSearch, participantFilter, dateFilter, sort]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  useEffect(() => {
    api.participants
      .list()
      .then(setParticipants)
      .catch(() => {
        // Non-critical: participants only power the filter/create pickers.
      });
  }, []);

  function handleClearFilters() {
    setParticipantFilter("");
    setDateFilter("");
  }

  function handleClearAll() {
    setSearchInput("");
    handleClearFilters();
  }

  function handleMeetingCreated(meeting: MeetingDetail) {
    setCreateModalOpen(false);
    // The new meeting now has a real transcript/summary/topics to look at,
    // so take the user straight there rather than leaving them on the list.
    router.push(`/meetings/${meeting.id}`);
  }

  const hasFilters = Boolean(debouncedSearch || participantFilter || dateFilter);

  const newMeetingButton = (
    <button
      type="button"
      onClick={() => setCreateModalOpen(true)}
      className="control-focus flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow active:scale-[0.98] sm:px-3.5"
    >
      <Plus size={16} />
      <span className="hidden sm:inline">New Meeting</span>
    </button>
  );

  return (
    <>
      <Topbar
        title="Meetings"
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        actions={newMeetingButton}
      />

      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Meetings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {status === "idle" && meetings
                ? `${meetings.length} meeting${meetings.length === 1 ? "" : "s"}`
                : "Your recorded and scheduled meetings"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <FilterControls
              participants={participants}
              participantFilter={participantFilter}
              onParticipantFilterChange={setParticipantFilter}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              onClear={handleClearFilters}
            />
            <SortControl value={sort} onChange={setSort} />
          </div>

          {status === "loading" && <MeetingListSkeleton />}

          {status === "error" && errorMessage && (
            <ErrorState message={errorMessage} onRetry={fetchMeetings} />
          )}

          {status === "idle" && meetings && meetings.length === 0 && !hasFilters && (
            <EmptyState
              icon={Video}
              title="Looks like you haven't recorded a meeting yet"
              description="Once you create your first meeting, it'll show up right here."
              action={
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="control-focus rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow active:scale-[0.98]"
                >
                  + New Meeting
                </button>
              }
            />
          )}

          {status === "idle" && meetings && meetings.length === 0 && hasFilters && (
            <EmptyState
              icon={SearchX}
              title="No meetings match your search"
              description="Try a different keyword, participant, or date."
              action={
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="control-focus rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Clear filters
                </button>
              }
            />
          )}

          {status === "idle" && meetings && meetings.length > 0 && (
            <MeetingList
              meetings={meetings}
              onSelectMeeting={(id) => {
                showToast("Opening meeting…", "info");
                router.push(`/meetings/${id}`);
              }}
            />
          )}
        </div>
      </main>

      {isCreateModalOpen && (
        <MeetingFormModal
          mode="create"
          participants={participants}
          onClose={() => setCreateModalOpen(false)}
          onSaved={handleMeetingCreated}
        />
      )}
    </>
  );
}
