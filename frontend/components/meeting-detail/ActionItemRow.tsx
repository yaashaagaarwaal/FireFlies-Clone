import { Check, Trash2 } from "lucide-react";

import { initialsFor } from "@/lib/format";
import type { ActionItem } from "@/lib/types";

interface ActionItemRowProps {
  item: ActionItem;
  isEditing: boolean;
  editingText: string;
  onEditingTextChange: (value: string) => void;
  isBusy: boolean;
  onToggleComplete: () => void;
  onStartEdit: () => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onDeleteRequest: () => void;
}

export function ActionItemRow({
  item,
  isEditing,
  editingText,
  onEditingTextChange,
  isBusy,
  onToggleComplete,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onDeleteRequest,
}: ActionItemRowProps) {
  return (
    <div
      className={`group flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50 ${isBusy ? "pointer-events-none opacity-50" : ""}`}
    >
      <button
        type="button"
        onClick={onToggleComplete}
        aria-label={item.is_complete ? "Mark incomplete" : "Mark complete"}
        className={`control-focus flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
          item.is_complete
            ? "border-indigo-600 bg-indigo-600 text-white"
            : "border-gray-300 hover:border-indigo-400"
        }`}
      >
        {item.is_complete && <Check size={12} strokeWidth={3} />}
      </button>

      {isEditing ? (
        <input
          autoFocus
          value={editingText}
          onChange={(event) => onEditingTextChange(event.target.value)}
          onBlur={onCommitEdit}
          onKeyDown={(event) => {
            if (event.key === "Enter") onCommitEdit();
            if (event.key === "Escape") onCancelEdit();
          }}
          className="field-focus flex-1 rounded-md border border-indigo-300 px-1.5 py-0.5 text-sm text-gray-900"
        />
      ) : (
        <button
          type="button"
          onClick={onStartEdit}
          className={`control-focus flex-1 rounded text-left text-sm transition-colors ${item.is_complete ? "text-gray-400 line-through" : "text-gray-800"}`}
        >
          {item.text}
        </button>
      )}

      {item.assignee && (
        <span
          title={item.assignee.name}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white ring-2 ring-white"
          style={{ backgroundColor: item.assignee.avatar_color }}
        >
          {initialsFor(item.assignee.name)}
        </span>
      )}

      <button
        type="button"
        onClick={onDeleteRequest}
        aria-label="Delete action item"
        className="control-focus shrink-0 rounded p-1 text-gray-300 opacity-0 transition-colors hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
