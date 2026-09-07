from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.action_item import ActionItemRead
from app.schemas.participant import ParticipantRead
from app.schemas.summary import SummaryRead
from app.schemas.topic import TopicRead
from app.schemas.transcript import TranscriptSegmentRead


class MeetingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    date: datetime
    duration_seconds: int = Field(default=0, ge=0)
    media_url: str | None = None
    participant_ids: list[int] = []
    transcript_text: str | None = Field(default=None, description="Pasted or uploaded transcript text")


class MeetingUpdate(BaseModel):
    """Full-replace body for PUT /api/meetings/{id}. title and date are
    required (PUT replaces the resource); omitting participant_ids clears
    all participants rather than leaving them untouched, consistent with
    replace-the-whole-resource semantics.
    """

    title: str = Field(min_length=1, max_length=255)
    date: datetime
    duration_seconds: int = Field(default=0, ge=0)
    media_url: str | None = None
    participant_ids: list[int] = []


class MeetingListItem(BaseModel):
    """Lightweight shape for the meetings library list."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    date: datetime
    duration_seconds: int
    status: str
    participants: list[ParticipantRead]


class MeetingDetail(BaseModel):
    """Full shape for the meeting detail page."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    date: datetime
    duration_seconds: int
    media_url: str | None
    status: str
    participants: list[ParticipantRead]
    transcript_segments: list[TranscriptSegmentRead]
    summary: SummaryRead | None
    topics: list[TopicRead]
    action_items: list[ActionItemRead]
