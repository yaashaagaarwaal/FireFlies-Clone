import { ListChecks } from "lucide-react";

import { Topbar } from "@/components/layout/Topbar";

export default function TasksPage() {
  return (
    <>
      <Topbar title="Tasks" />
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-400">
          <ListChecks size={24} />
        </div>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Coming soon
        </span>
        <h1 className="text-lg font-semibold text-gray-900">A unified view of every task</h1>
        <p className="max-w-sm text-sm text-gray-500">
          Action items across all your meetings will show up here. For now, add and track them from
          each meeting&apos;s detail page.
        </p>
      </main>
    </>
  );
}
