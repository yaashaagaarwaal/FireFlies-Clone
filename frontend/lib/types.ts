export interface Participant {
  id: number;
  name: string;
  email: string | null;
  avatar_color: string;
}

export interface TranscriptSegment {
  id: number;
  start_time_sec: number;
  end_time_sec: number;
  text: string;
  order_index: number;
  speaker: Participant | null;
}

export interface Summary {
  id: number;
  overview_text: string;
}

export interface Topic {
  id: number;
  title: string;
  order_index: number;
  start_time_sec: number | null;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  text: string;
  due_date: string | null;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
  assignee: Participant | null;
}

export interface MeetingListItem {
  id: number;
  title: string;
  date: string;
  duration_seconds: number;
  status: string;
  participants: Participant[];
}

export interface MeetingDetail {
  id: number;
  title: string;
  date: string;
  duration_seconds: number;
  media_url: string | null;
  status: string;
  participants: Participant[];
  transcript_segments: TranscriptSegment[];
  summary: Summary | null;
  topics: Topic[];
  action_items: ActionItem[];
}

export interface MeetingCreateInput {
  title: string;
  date: string;
  duration_seconds?: number;
  media_url?: string | null;
  participant_ids?: number[];
  transcript_text?: string | null;
}

export interface MeetingUpdateInput {
  /** PUT is a full replace: title/date are required, and omitting
   * participant_ids clears all participants rather than leaving them as-is. */
  title: string;
  date: string;
  duration_seconds?: number;
  media_url?: string | null;
  participant_ids?: number[];
}
