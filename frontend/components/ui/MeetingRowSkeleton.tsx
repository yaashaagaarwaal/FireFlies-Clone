export function MeetingRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-3 w-1/3 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="h-2.5 w-1/4 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  );
}

export function MeetingListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <MeetingRowSkeleton />
      <MeetingRowSkeleton />
      <MeetingRowSkeleton />
    </div>
  );
}
