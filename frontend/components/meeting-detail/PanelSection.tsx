import type { LucideIcon } from "lucide-react";

interface PanelSectionProps {
  icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

/** Shared card chrome for the detail-page panels (Overview, Topics, Action
 * items) — one place guaranteeing the icon badge, heading, and card styling
 * stay in sync instead of three components each hand-rolling the same look. */
export function PanelSection({ icon: Icon, title, action, children }: PanelSectionProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-sm font-semibold text-gray-900">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Icon size={15} />
          </span>
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-3.5">{children}</div>
    </section>
  );
}
