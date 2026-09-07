from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.participant import ParticipantRead


class ActionItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: int
    text: str
    due_date: datetime | None
    is_complete: bool
    created_at: datetime
    updated_at: datetime
    assignee: ParticipantRead | None = None


class ActionItemCreate(BaseModel):
    text: str = Field(min_length=1)
    assignee_id: int | None = None
    due_date: datetime | None = None


class ActionItemUpdate(BaseModel):
    """Full-replace body for PUT /api/action-items/{id}."""

    text: str = Field(min_length=1)
    assignee_id: int | None = None
    due_date: datetime | None = None
    is_complete: bool = False
