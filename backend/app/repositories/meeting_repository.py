"""Data access for Meeting and its owned children. No business rules here —
just queries. Validation and orchestration live in app.services.meeting_service.
"""
from datetime import date as date_type

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.action_item import ActionItem
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.summary import Summary
from app.models.topic import Topic
from app.models.transcript import TranscriptSegment

LIST_LOAD_OPTIONS = (selectinload(Meeting.participants),)

DETAIL_LOAD_OPTIONS = (
    selectinload(Meeting.participants),
    selectinload(Meeting.transcript_segments).selectinload(TranscriptSegment.speaker),
    selectinload(Meeting.summary),
    selectinload(Meeting.topics),
    selectinload(Meeting.action_items).selectinload(ActionItem.assignee),
)


def get_by_id(db: Session, meeting_id: int, *load_options) -> Meeting | None:
    stmt = select(Meeting).where(Meeting.id == meeting_id).options(*load_options)
    return db.scalars(stmt).first()


def list_meetings(
    db: Session,
    *,
    search: str | None = None,
    participant: str | None = None,
    on_date: date_type | None = None,
    sort: str = "recent",
) -> list[Meeting]:
    stmt = select(Meeting).options(*LIST_LOAD_OPTIONS)

    if search:
        stmt = stmt.where(Meeting.title.ilike(f"%{search}%"))
    if participant:
        stmt = stmt.join(Meeting.participants).where(Participant.name.ilike(f"%{participant}%"))
    if on_date:
        stmt = stmt.where(func.date(Meeting.date) == on_date.isoformat())

    stmt = stmt.order_by(Meeting.title if sort == "title" else Meeting.date.desc())
    return list(db.scalars(stmt).unique())


def create(db: Session, meeting: Meeting) -> Meeting:
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


def save(db: Session, meeting: Meeting) -> Meeting:
    """Persist in-place mutations already made on `meeting`. updated_at is
    refreshed automatically by the model's onupdate= — no need to set it here.
    """
    db.commit()
    db.refresh(meeting)
    return meeting


def delete(db: Session, meeting: Meeting) -> None:
    db.delete(meeting)
    db.commit()


def get_transcript_segments(db: Session, meeting_id: int) -> list[TranscriptSegment]:
    stmt = (
        select(TranscriptSegment)
        .where(TranscriptSegment.meeting_id == meeting_id)
        .options(selectinload(TranscriptSegment.speaker))
        .order_by(TranscriptSegment.order_index)
    )
    return list(db.scalars(stmt))


def get_summary(db: Session, meeting_id: int) -> Summary | None:
    stmt = select(Summary).where(Summary.meeting_id == meeting_id)
    return db.scalars(stmt).first()


def get_topics(db: Session, meeting_id: int) -> list[Topic]:
    stmt = select(Topic).where(Topic.meeting_id == meeting_id).order_by(Topic.order_index)
    return list(db.scalars(stmt))
