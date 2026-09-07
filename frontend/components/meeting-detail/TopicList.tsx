import { ListTree } from "lucide-react";

import { formatClockTime } from "@/lib/format";
import type { Topic } from "@/lib/types";

import { PanelSection } from "./PanelSection";

interface TopicListProps {
  topics: Topic[];
  onSeek: (seconds: number) => void;
}

export function TopicList({ topics, onSeek }: TopicListProps) {
  return (
    <PanelSection icon={ListTree} title="Topics">
      {topics.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">No topics identified for this meeting yet.</p>
      ) : (
        <ol className="flex flex-col gap-0.5">
          {topics.map((topic, index) => {
            const clickable = topic.start_time_sec !== null;
            return (
              <li key={topic.id}>
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && onSeek(topic.start_time_sec as number)}
                  className={`control-focus flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                    clickable
                      ? "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-gray-300 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                      : "cursor-default text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {index + 1}
                  </span>
                  <span className="flex-1">{topic.title}</span>
                  {topic.start_time_sec !== null && (
                    <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
                      {formatClockTime(topic.start_time_sec)}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </PanelSection>
  );
}
