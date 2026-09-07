from datetime import date as date_type

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.meeting import Meeting
from app.schemas.meeting import MeetingCreate, MeetingDetail, MeetingListItem, MeetingUpdate
from app.schemas.summary import SummaryRead
from app.schemas.topic import TopicRead
from app.schemas.transcript import TranscriptSegmentRead
from app.services import meeting_service

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


@router.get("", response_model=list[MeetingListItem])
def list_meetings(
    db: Session = Depends(get_db),
    search: str | None = Query(default=None, description="Match against meeting title"),
    participant: str | None = Query(default=None, description="Match against participant name"),
    date: date_type | None = Query(default=None, description="Match meetings occurring on this calendar date"),
    sort: str = Query(default="recent", pattern="^(recent|title)$"),
) -> list[Meeting]:
    return meeting_service.list_meetings(db, search=search, participant=participant, on_date=date, sort=sort)


@router.post("", response_model=MeetingDetail, status_code=201)
def create_meeting(payload: MeetingCreate, db: Session = Depends(get_db)) -> Meeting:
    return meeting_service.create_meeting(db, payload)


@router.get("/{meeting_id}", response_model=MeetingDetail)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)) -> Meeting:
    return meeting_service.get_meeting(db, meeting_id)


@router.put("/{meeting_id}", response_model=MeetingDetail)
def update_meeting(meeting_id: int, payload: MeetingUpdate, db: Session = Depends(get_db)) -> Meeting:
    return meeting_service.update_meeting(db, meeting_id, payload)


@router.delete("/{meeting_id}", status_code=204)
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)) -> None:
    meeting_service.delete_meeting(db, meeting_id)


@router.get("/{meeting_id}/transcript", response_model=list[TranscriptSegmentRead])
def get_transcript(meeting_id: int, db: Session = Depends(get_db)):
    return meeting_service.get_transcript(db, meeting_id)


@router.get("/{meeting_id}/summary", response_model=SummaryRead)
def get_summary(meeting_id: int, db: Session = Depends(get_db)):
    return meeting_service.get_summary(db, meeting_id)


@router.get("/{meeting_id}/topics", response_model=list[TopicRead])
def get_topics(meeting_id: int, db: Session = Depends(get_db)):
    return meeting_service.get_topics(db, meeting_id)
