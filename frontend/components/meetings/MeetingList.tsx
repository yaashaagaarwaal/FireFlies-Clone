import type { MeetingListItem } from "@/lib/types";

import { MeetingRow } from "./MeetingRow";

interface MeetingListProps {
  meetings: MeetingListItem[];
  onSelectMeeting: (id: number) => void;
}

export function MeetingList({ meetings, onSelectMeeting }: MeetingListProps) {
  return (
    <div className="flex flex-col gap-2">
      {meetings.map((meeting) => (
        <MeetingRow key={meeting.id} meeting={meeting} onClick={() => onSelectMeeting(meeting.id)} />
      ))}
    </div>
  );
}
