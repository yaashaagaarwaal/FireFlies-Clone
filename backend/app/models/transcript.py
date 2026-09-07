from sqlalchemy import CheckConstraint, Float, ForeignKey, Index, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class TranscriptSegment(Base):
    """One line of dialogue. Ordering within a meeting is explicit
    (order_index) rather than inferred from start_time_sec, so segment
    order stays stable even if two speakers' timestamps overlap.
    """

    __tablename__ = "transcript_segments"
    __table_args__ = (
        CheckConstraint("end_time_sec >= start_time_sec", name="ck_transcript_segments_time_range"),
        Index("ix_transcript_segments_meeting_order", "meeting_id", "order_index"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"))
    speaker_id: Mapped[int | None] = mapped_column(
        ForeignKey("participants.id", ondelete="SET NULL"), nullable=True
    )
    start_time_sec: Mapped[float] = mapped_column(Float)
    end_time_sec: Mapped[float] = mapped_column(Float)
    text: Mapped[str] = mapped_column(Text)
    order_index: Mapped[int] = mapped_column(Integer)

    meeting: Mapped["Meeting"] = relationship(back_populates="transcript_segments")
    speaker: Mapped["Participant | None"] = relationship()
