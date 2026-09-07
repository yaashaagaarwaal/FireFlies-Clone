"""Data access for Participant."""
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.participant import Participant


def list_all(db: Session) -> list[Participant]:
    return list(db.scalars(select(Participant).order_by(Participant.name)))


def find_by_name(db: Session, name: str) -> Participant | None:
    """Case-insensitive exact-name lookup, used to link a transcript's
    speaker labels to existing participants instead of creating duplicates.
    """
    stmt = select(Participant).where(func.lower(Participant.name) == name.strip().lower())
    return db.scalars(stmt).first()


def get_by_ids(db: Session, participant_ids: list[int]) -> list[Participant]:
    if not participant_ids:
        return []
    stmt = select(Participant).where(Participant.id.in_(participant_ids))
    return list(db.scalars(stmt))


def get_by_id(db: Session, participant_id: int) -> Participant | None:
    return db.get(Participant, participant_id)
