/** Mirrors the loaded layout's shape (header, player, panels, transcript)
 * instead of a bare spinner, so the page doesn't visually jump once data
 * arrives — consistent with the dashboard's row skeletons. */
export function MeetingDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
      <div className="flex-1 overflow-hidden px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-3xl animate-pulse flex-col gap-5">
          <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 dark:border-gray-800">
            <div className="h-3 w-28 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="h-7 w-2/3 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="flex gap-4">
              <div className="h-3.5 w-32 rounded-full bg-gray-100 dark:bg-gray-800" />
              <div className="h-3.5 w-20 rounded-full bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
          <div className="h-16 rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900" />
          <div className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="h-4 w-24 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800" />
            <div className="h-3 w-5/6 rounded-full bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="h-4 w-20 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-2/3 rounded-full bg-gray-100 dark:bg-gray-800" />
            <div className="h-3 w-1/2 rounded-full bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
      </div>
      <div className="hidden w-full shrink-0 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:block md:w-[380px] md:border-l md:border-t-0">
        <div className="animate-pulse border-b border-gray-100 p-4 dark:border-gray-800">
          <div className="h-4 w-24 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="mt-3 h-8 rounded-lg bg-gray-100 dark:bg-gray-800" />
        </div>
        <div className="flex animate-pulse flex-col gap-3 p-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 px-3 py-2.5">
              <div className="h-7 w-7 shrink-0 rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="flex-1 space-y-2">
                <div className="h-2.5 w-24 rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
