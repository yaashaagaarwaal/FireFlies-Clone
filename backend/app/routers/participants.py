from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.participant import Participant
from app.schemas.participant import ParticipantRead
from app.services import participant_service

router = APIRouter(prefix="/api/participants", tags=["participants"])


@router.get("", response_model=list[ParticipantRead])
def list_participants(db: Session = Depends(get_db)) -> list[Participant]:
    return participant_service.list_participants(db)
