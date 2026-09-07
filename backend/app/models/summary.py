from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Summary(Base):
    """One AI-generated overview per meeting — a strict 1:1, enforced by the
    unique constraint on meeting_id (a second insert for the same meeting
    fails rather than silently creating a duplicate).
    """

    __tablename__ = "summaries"

    id: Mapped[int] = mapped_column(primary_key=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"), unique=True)
    overview_text: Mapped[str] = mapped_column(Text)

    meeting: Mapped["Meeting"] = relationship(back_populates="summary")
