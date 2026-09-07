import type {
  ActionItem,
  MeetingCreateInput,
  MeetingDetail,
  MeetingListItem,
  MeetingUpdateInput,
  Participant,
  Summary,
  Topic,
  TranscriptSegment,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** FastAPI error bodies come in two shapes: `{"detail": "some message"}` from
 * our own handlers (NotFoundError, InvalidInputError, ...), or
 * `{"detail": [{"loc": [...], "msg": "...", ...}, ...]}` from Pydantic's
 * automatic request validation (422s) — a plain `?? statusText` fallback
 * would pass that array straight into `Error`'s constructor and stringify
 * to "[object Object]" instead of a readable message.
 */
function extractErrorMessage(body: unknown, statusText: string): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string" && detail) return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const messages = detail
        .map((entry) => (entry && typeof entry === "object" && "msg" in entry ? String(entry.msg) : null))
        .filter((msg): msg is string => Boolean(msg));
      if (messages.length > 0) return messages.join("; ");
    }
  }
  return statusText || "Request failed";
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(extractErrorMessage(body, response.statusText), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export interface MeetingListParams {
  search?: string;
  participant?: string;
  /** ISO calendar date, e.g. "2026-09-03" — matches meetings on that day. */
  date?: string;
  sort?: "recent" | "title";
}

export interface ActionItemInput {
  text: string;
  assignee_id?: number | null;
  due_date?: string | null;
}

export const api = {
  health: () => request<{ status: string; database: string }>("/api/health"),

  meetings: {
    list: (params: MeetingListParams = {}) => {
      const query = new URLSearchParams();
      if (params.search) query.set("search", params.search);
      if (params.participant) query.set("participant", params.participant);
      if (params.date) query.set("date", params.date);
      if (params.sort) query.set("sort", params.sort);
      const qs = query.toString();
      return request<MeetingListItem[]>(`/api/meetings${qs ? `?${qs}` : ""}`);
    },
    get: (id: number) => request<MeetingDetail>(`/api/meetings/${id}`),
    create: (input: MeetingCreateInput) =>
      request<MeetingDetail>("/api/meetings", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    /** Full replace — see MeetingUpdateInput. */
    update: (id: number, input: MeetingUpdateInput) =>
      request<MeetingDetail>(`/api/meetings/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    delete: (id: number) => request<void>(`/api/meetings/${id}`, { method: "DELETE" }),
    transcript: (id: number) => request<TranscriptSegment[]>(`/api/meetings/${id}/transcript`),
    summary: (id: number) => request<Summary>(`/api/meetings/${id}/summary`),
    topics: (id: number) => request<Topic[]>(`/api/meetings/${id}/topics`),
  },

  actionItems: {
    listForMeeting: (meetingId: number) =>
      request<ActionItem[]>(`/api/meetings/${meetingId}/action-items`),
    create: (meetingId: number, input: ActionItemInput) =>
      request<ActionItem>(`/api/meetings/${meetingId}/action-items`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    /** Full replace — every field (including is_complete) must be supplied. */
    update: (
      id: number,
      input: ActionItemInput & { is_complete: boolean },
    ) =>
      request<ActionItem>(`/api/action-items/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    delete: (id: number) => request<void>(`/api/action-items/${id}`, { method: "DELETE" }),
  },

  participants: {
    list: () => request<Participant[]>("/api/participants"),
  },
};
