"""Business logic for participants (currently just a passthrough — listing
participants has no rules beyond "return them all", but the service layer
exists so routers never talk to the database directly)."""
from sqlalchemy.orm import Session

from app.models.participant import Participant
from app.repositories import participant_repository


def list_participants(db: Session) -> list[Participant]:
    return participant_repository.list_all(db)
