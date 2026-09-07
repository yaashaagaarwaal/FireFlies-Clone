"use client";

import { CheckSquare, Plus } from "lucide-react";
import { useState } from "react";

import { api, ApiError } from "@/lib/api";
import type { ActionItem, Participant } from "@/lib/types";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/ToastProvider";

import { ActionItemRow } from "./ActionItemRow";
import { PanelSection } from "./PanelSection";

interface ActionItemsProps {
  meetingId: number;
  actionItems: ActionItem[];
  participants: Participant[];
  onChanged: () => void;
}

export function ActionItems({ meetingId, actionItems, participants, onChanged }: ActionItemsProps) {
  const { showToast } = useToast();

  const [newText, setNewText] = useState("");
  const [newAssigneeId, setNewAssigneeId] = useState<number | "">("");
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ActionItem | null>(null);

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = newText.trim();
    if (!trimmed) return;

    setAdding(true);
    try {
      await api.actionItems.create(meetingId, {
        text: trimmed,
        assignee_id: newAssigneeId === "" ? null : newAssigneeId,
      });
      setNewText("");
      setNewAssigneeId("");
      showToast("Action item added", "success");
      onChanged();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to add action item.", "error");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleComplete(item: ActionItem) {
    setBusyId(item.id);
    try {
      await api.actionItems.update(item.id, {
        text: item.text,
        assignee_id: item.assignee?.id ?? null,
        due_date: item.due_date,
        is_complete: !item.is_complete,
      });
      onChanged();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to update action item.", "error");
    } finally {
      setBusyId(null);
    }
  }

  function startEditing(item: ActionItem) {
    setEditingId(item.id);
    setEditingText(item.text);
  }

  async function commitEdit(item: ActionItem) {
    const trimmed = editingText.trim();
    setEditingId(null);
    if (!trimmed || trimmed === item.text) return;

    setBusyId(item.id);
    try {
      await api.actionItems.update(item.id, {
        text: trimmed,
        assignee_id: item.assignee?.id ?? null,
        due_date: item.due_date,
        is_complete: item.is_complete,
      });
      showToast("Action item updated", "success");
      onChanged();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to update action item.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item: ActionItem) {
    setBusyId(item.id);
    try {
      await api.actionItems.delete(item.id);
      showToast("Action item deleted", "success");
      onChanged();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to delete action item.", "error");
    } finally {
      setBusyId(null);
      setDeleteTarget(null);
    }
  }

  const completedCount = actionItems.filter((item) => item.is_complete).length;

  return (
    <PanelSection
      icon={CheckSquare}
      title="Action items"
      action={
        actionItems.length > 0 && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {completedCount} of {actionItems.length} done
          </span>
        )
      }
    >
      <div className="flex flex-col gap-0.5">
        {actionItems.length === 0 && <p className="py-2 text-sm text-gray-400 dark:text-gray-500">No action items yet.</p>}
        {actionItems.map((item) => (
          <ActionItemRow
            key={item.id}
            item={item}
            isEditing={editingId === item.id}
            editingText={editingText}
            onEditingTextChange={setEditingText}
            isBusy={busyId === item.id}
            onToggleComplete={() => handleToggleComplete(item)}
            onStartEdit={() => startEditing(item)}
            onCommitEdit={() => commitEdit(item)}
            onCancelEdit={() => setEditingId(null)}
            onDeleteRequest={() => setDeleteTarget(item)}
          />
        ))}
      </div>

      <form onSubmit={handleAdd} className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3.5 dark:border-gray-800 sm:flex-row">
        <input
          value={newText}
          onChange={(event) => setNewText(event.target.value)}
          placeholder="Add a task…"
          className="field-focus flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
        />
        <Select
          value={newAssigneeId}
          onChange={(event) => setNewAssigneeId(event.target.value === "" ? "" : Number(event.target.value))}
          className="sm:w-40"
        >
          <option value="">Unassigned</option>
          {participants.map((participant) => (
            <option key={participant.id} value={participant.id}>
              {participant.name}
            </option>
          ))}
        </Select>
        <button
          type="submit"
          disabled={adding || !newText.trim()}
          className="control-focus flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={15} />
          Add
        </button>
      </form>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete action item"
          message={`Delete "${deleteTarget.text}"? This can't be undone.`}
          confirmLabel="Delete"
          destructive
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}
    </PanelSection>
  );
}
