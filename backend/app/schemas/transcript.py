from pydantic import BaseModel, ConfigDict

from app.schemas.participant import ParticipantRead


class TranscriptSegmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    start_time_sec: float
    end_time_sec: float
    text: str
    order_index: int
    speaker: ParticipantRead | None = None
