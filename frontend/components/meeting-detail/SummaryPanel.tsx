import { FileText } from "lucide-react";

import type { Summary } from "@/lib/types";

import { PanelSection } from "./PanelSection";

interface SummaryPanelProps {
  summary: Summary | null;
}

export function SummaryPanel({ summary }: SummaryPanelProps) {
  return (
    <PanelSection icon={FileText} title="Overview">
      {summary ? (
        <p className="text-sm leading-relaxed text-gray-700">{summary.overview_text}</p>
      ) : (
        <p className="text-sm text-gray-400">No summary generated for this meeting yet.</p>
      )}
    </PanelSection>
  );
}
