"""Import all models so Base.metadata is fully populated for create_all()."""
from app.models.user import User
from app.models.participant import Participant
from app.models.meeting import Meeting, meeting_participants
from app.models.transcript import TranscriptSegment
from app.models.summary import Summary
from app.models.topic import Topic
from app.models.action_item import ActionItem

__all__ = [
    "User",
    "Participant",
    "Meeting",
    "meeting_participants",
    "TranscriptSegment",
    "Summary",
    "Topic",
    "ActionItem",
]
