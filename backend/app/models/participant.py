from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Participant(Base):
    """A person who can attend meetings. Not owned by any single meeting —
    the same participant is reused across meetings via the meeting_participants
    join table, and via speaker_id / assignee_id foreign keys elsewhere.
    """

    __tablename__ = "participants"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    avatar_color: Mapped[str] = mapped_column(String(20), default="#6D5EF8")

    meetings: Mapped[list["Meeting"]] = relationship(
        secondary="meeting_participants", back_populates="participants"
    )
