import { initialsFor } from "@/lib/format";
import type { Participant } from "@/lib/types";

interface ParticipantAvatarsProps {
  participants: Participant[];
  max?: number;
}

export function ParticipantAvatars({ participants, max = 4 }: ParticipantAvatarsProps) {
  if (participants.length === 0) {
    return <span className="text-xs text-gray-400">No participants</span>;
  }

  const visible = participants.slice(0, max);
  const overflow = participants.length - visible.length;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((participant) => (
        <div
          key={participant.id}
          title={participant.name}
          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white"
          style={{ backgroundColor: participant.avatar_color }}
        >
          {initialsFor(participant.name)}
        </div>
      ))}
      {overflow > 0 && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-semibold text-gray-600">
          +{overflow}
        </div>
      )}
    </div>
  );
}
